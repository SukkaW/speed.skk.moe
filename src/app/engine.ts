/* eslint-disable no-await-in-loop -- pings and samples are sequential by design */
import { noop } from 'foxts/noop';
import { wait } from 'foxts/wait';
import { SAMPLE_INTERVAL, estimate, shouldStop, sustained } from './stability';

export type ThreadMode = 'single' | 'multi';
export type Phase = 'idle' | 'latency' | 'download' | 'upload' | 'done';

export interface Results {
  latency: number | null,
  jitter: number | null,
  download: number | null,
  upload: number | null,
  /** Latency measured while the link was saturated in each direction. */
  downloadLatency: number | null,
  uploadLatency: number | null
}

/** Readings recorded per throughput phase, one per sample interval. */
export interface Trend {
  download: number[],
  upload: number[]
}

/** Bytes transferred so far in each direction. */
export interface Traffic {
  download: number,
  upload: number
}

export interface SpeedtestState {
  phase: Phase,
  /** Live reading for the current phase: ms during latency, Mbps otherwise. Smoothed for display. */
  live: number,
  /** Live latency under load while a throughput phase runs; null until the first ping lands. */
  loaded: number | null,
  results: Results,
  trend: Trend,
  traffic: Traffic
}

export const IDLE: SpeedtestState = {
  phase: 'idle',
  live: 0,
  loaded: null,
  results: { latency: null, jitter: null, download: null, upload: null, downloadLatency: null, uploadLatency: null },
  trend: { download: [], upload: [] },
  traffic: { download: 0, upload: 0 }
};

// Served as an image so the CDN never brotli-compresses it on the fly, which would cap throughput.
const OBJECT_PATH = '/redacted/object';
const PRIMARY = 'https://redacted-mirror-1.invalid';
// Each host is its own HTTP/2 connection, so multi-thread spreads across mirrors instead of
// multiplexing onto one connection's congestion window.
const MIRRORS = [
  PRIMARY,
  'https://redacted-mirror-2.invalid',
  'https://redacted-mirror-3.invalid',
  'https://redacted-mirror-4.invalid',
  'https://redacted-mirror-5.invalid'
];

// Idle pings run back to back: at least MIN, at most MAX, stopping once the budget is spent.
/** Concurrent transfers per host, multiplexed on its single HTTP/2 connection. */
const REQUESTS_PER_HOST = 3;
/** Share of a body received before the next request is issued, so first-byte waits overlap transfers. */
const PREFETCH_AT = 0.5;
/** Accepts and discards POST bodies. Served over HTTP/1.1, so every stream is its own TCP connection. */
const UPLOAD_URL = 'https://redacted-upload.invalid/sink';
const UPLOAD_STREAMS = 3;
// Each POST is timed to the server's reply, the only signal that the bytes actually left: a proxy
// or TUN in front of the browser accepts a body at memory speed, so upload progress events only
// measure buffering. Bodies start small and grow to take about UPLOAD_TARGET seconds each, so a
// stream reports about once a second while the reply's round trip stays a small share of each.
const UPLOAD_FIRST_BYTES = 256 * 1024;
const UPLOAD_MAX_BYTES = 32 * 1024 * 1024;
/** Seconds. */
const UPLOAD_TARGET = 1;
const LATENCY_PINGS_MIN = 8;
const LATENCY_PINGS_MAX = 20;
/** ms. */
const LATENCY_BUDGET = 2000;
/** ms between pings while the link is saturated. */
const LOADED_PING_INTERVAL = 400;
/** Most recent loaded pings that form the loaded-latency result. */
const LOADED_POINTS = 20;
/** ms an in-flight loaded ping may still land after the streams stop. */
const LOADED_PING_GRACE = 1500;

// The headline eases toward the same sustained rate the result is taken from, every sample,
// with a 1.2 s time constant. The digits roll continuously instead of stepping, the pulsing of
// a single flow-controlled connection never reaches them, and the final figure lands where the
// live one already was, give or take the easing lag.
const HEADLINE_SMOOTHING = 1 - Math.exp(-SAMPLE_INTERVAL / 1.2);
// The chart plots a one-second moving average of the samples, lightly eased. It reaches the
// plateau within about a second and keeps the slower swings of a link that genuinely changes,
// while the sub-second ripple of flow control and the steps of per-request upload readings
// average out.
const CHART_WINDOW = Math.round(1 / SAMPLE_INTERVAL);
const CHART_POLISH = 1 - Math.exp(-SAMPLE_INTERVAL / 0.5);
// Sparse readings such as loaded pings follow an exponential moving average instead.
const SMOOTHING = 1 - Math.exp(-SAMPLE_INTERVAL / 0.6);
const smooth = (shown: number, reading: number) => shown + (reading - shown) * SMOOTHING;

function median(values: readonly number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function meanAbsoluteDelta(values: readonly number[]) {
  let sum = 0;
  for (let i = 1, len = values.length; i < len; i++) sum += Math.abs(values[i] - values[i - 1]);
  return sum / (values.length - 1);
}

async function discard(body: ReadableStream<Uint8Array> | null) {
  if (body !== null) {
    await body.cancel();
  }
}

/** Round trip to the primary edge: time to first byte of a one-byte range request. */
async function ping(signal: AbortSignal): Promise<number> {
  // The host ignores the query string; it only makes the Resource Timing entry addressable.
  const url = `${PRIMARY}${OBJECT_PATH}?ping=${performance.now().toFixed(3)}`;
  const started = performance.now();
  const response = await fetch(url, { cache: 'no-store', headers: { Range: 'bytes=0-0' }, signal });
  const headersAt = performance.now();
  // Headers are what we time; on a loaded connection the body can sit behind bulk data frames.
  await discard(response.body);
  const entry = performance.getEntriesByName(url, 'resource').at(-1) as PerformanceResourceTiming | undefined;
  // Timing-Allow-Origin: * is set, so these are populated cross-origin; the wall clock is the fallback.
  return entry && entry.requestStart > 0 && entry.responseStart > 0
    ? entry.responseStart - entry.requestStart
    : headersAt - started;
}

// Typed nullable here because the DOM lib shipped with the linter's TypeScript disagrees with tsc's.
function openReader(body: ReadableStream<Uint8Array> | null) {
  return body === null ? null : body.getReader();
}

/**
 * Keeps one transfer slot saturated. The next request is issued once half of the current body
 * has arrived, so the gap between bodies is hidden. Aborting the signal rejects the in-flight
 * read, which is how the loop exits.
 */
async function pump(url: string, signal: AbortSignal, meter: Meter) {
  const request = () => {
    const started = fetch(url, { cache: 'no-store', signal });
    // Awaited later; this only keeps an early rejection from surfacing as unhandled.
    started.catch(noop);
    return started;
  };
  let pending: Promise<Response> | null = null;
  for (;;) {
    try {
      const response = await (pending ?? request());
      const total = Number(response.headers.get('content-length'));
      let next: Promise<Response> | null = null;
      let received = 0;
      const reader = openReader(response.body);
      if (reader !== null) {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          received += value.byteLength;
          meter.flow(value.byteLength);
          if (next === null && total > 0 && received >= total * PREFETCH_AT) next = request();
        }
      }
      pending = next;
    } catch {
      if (signal.aborted) return;
      pending = null;
      await wait(300);
    }
  }
}

/**
 * Upload counterpart of pump: sequential POSTs on one connection, each timed to the server's
 * reply. A failed request leaves the stream idle until the retry and is reported as such.
 */
async function push(url: string, signal: AbortSignal, meter: Meter) {
  let bytes = UPLOAD_FIRST_BYTES;
  for (;;) {
    try {
      const started = performance.now();
      const response = await fetch(url, { method: 'POST', body: new Uint8Array(bytes), cache: 'no-store', signal });
      const seconds = (performance.now() - started) / 1000;
      await discard(response.body);
      if (!response.ok) throw new Error(`Upload rejected: ${response.status}`);
      meter.transfer(bytes, seconds);
      bytes = Math.min(UPLOAD_MAX_BYTES, Math.max(UPLOAD_FIRST_BYTES, Math.round((bytes / seconds) * UPLOAD_TARGET)));
    } catch {
      if (signal.aborted) return;
      meter.transfer(0, 1);
      await wait(300);
    }
  }
}

interface Meter {
  /** Bytes that just streamed through; the sampler turns them into a rate. */
  flow: (count: number) => void,
  /** A request of `bytes` the server took `seconds` to acknowledge; its rate holds until the next one. */
  transfer: (bytes: number, seconds: number) => void
}

type Pump = (signal: AbortSignal, meter: Meter) => Promise<void>;

interface Outcome {
  mbps: number,
  /** Settles once an in-flight loaded ping has landed or been given up on. */
  loadedLatency: Promise<number | null>
}

type Progress = (live: number, loaded: number | null, samples: number[], bytes: number) => void;

/** Runs the pumps until the stability rule fires, sampling throughput and pinging under load. */
async function measure(pumps: readonly Pump[], signal: AbortSignal, onProgress: Progress): Promise<Outcome> {
  const phase = new AbortController();
  const stop = () => phase.abort();
  signal.addEventListener('abort', stop, { once: true });

  let pending = 0;
  let acknowledged = 0;
  const held: number[] = [];
  const streams = pumps.map((start, i) => {
    held.push(0);
    return start(phase.signal, {
      flow(count) {
        pending += count;
      },
      transfer(bytes, seconds) {
        acknowledged += bytes;
        held[i] = (bytes * 8) / seconds / 1e6;
      }
    });
  });

  // Pings outlive the streams briefly so one already in flight can still land, but no new
  // ping starts once the link is idle again.
  const pings = new AbortController();
  const abortPings = () => pings.abort();
  signal.addEventListener('abort', abortPings, { once: true });
  const loadedPings: number[] = [];
  let shownLoaded: number | null = null;
  let loading = true;
  const pingsOver = () => !loading || pings.signal.aborted;
  const pinger = (async () => {
    for (;;) {
      await wait(LOADED_PING_INTERVAL);
      if (pingsOver()) return;
      try {
        const ms = await ping(pings.signal);
        loadedPings.push(ms);
        shownLoaded = shownLoaded === null ? ms : smooth(shownLoaded, ms);
      } catch {
        // Aborted or dropped; the next interval tries again.
      }
    }
  })();

  const samples: number[] = [];
  const estimates: number[] = [];
  // The chart and headline are display-only; the stability rule works on raw samples.
  const trend: number[] = [];
  let windowSum = 0;
  let chartLine = 0;
  let shown = 0;
  let bytes = 0;
  let last = performance.now();
  for (;;) {
    await wait(SAMPLE_INTERVAL * 1000);
    if (phase.signal.aborted) break;
    const now = performance.now();
    let mbps = (pending * 8) / ((now - last) / 1000) / 1e6;
    for (let i = 0, len = held.length; i < len; i++) mbps += held[i];
    bytes += pending + acknowledged;
    pending = 0;
    acknowledged = 0;
    last = now;
    samples.push(mbps);
    estimates.push(estimate(samples));
    shown += (sustained(samples) - shown) * HEADLINE_SMOOTHING;
    windowSum += mbps - (samples.length > CHART_WINDOW ? samples[samples.length - 1 - CHART_WINDOW] : 0);
    chartLine += (windowSum / Math.min(samples.length, CHART_WINDOW) - chartLine) * CHART_POLISH;
    trend.push(chartLine);
    onProgress(shown, shownLoaded, [...trend], bytes);
    if (shouldStop(estimates)) break;
  }

  stop();
  loading = false;
  signal.removeEventListener('abort', stop);
  await Promise.allSettled(streams);

  const settleLoaded = async () => {
    if (loadedPings.length === 0) await wait(LOADED_PING_GRACE);
    abortPings();
    await pinger;
    signal.removeEventListener('abort', abortPings);
    return loadedPings.length > 0 ? median(loadedPings.slice(-LOADED_POINTS)) : null;
  };
  return { mbps: sustained(samples), loadedLatency: settleLoaded() };
}

/**
 * Runs the full test, publishing state as it goes. Rejects with an AbortError when the
 * signal fires; nothing is published after that.
 */
export async function runSpeedtest(mode: ThreadMode, signal: AbortSignal, onState: (state: SpeedtestState) => void): Promise<void> {
  let state: SpeedtestState = { ...IDLE, phase: 'latency' };
  const publish = (patch: Partial<SpeedtestState>) => {
    if (signal.aborted) return;
    state = { ...state, ...patch };
    onState(state);
  };

  performance.clearResourceTimings();
  // The first ping opens the connection and is discarded.
  await ping(signal);
  const pings: number[] = [];
  const budgetEnds = performance.now() + LATENCY_BUDGET;
  while (pings.length < LATENCY_PINGS_MAX && (pings.length < LATENCY_PINGS_MIN || performance.now() < budgetEnds)) {
    const ms = await ping(signal);
    pings.push(ms);
    publish({ phase: 'latency', live: ms });
  }
  publish({ results: { ...state.results, latency: median(pings), jitter: meanAbsoluteDelta(pings) } });

  const downloadPumps: Pump[] = [];
  const hosts = mode === 'multi' ? MIRRORS : [PRIMARY];
  for (let h = 0, len = hosts.length; h < len; h++) {
    for (let i = 0; i < REQUESTS_PER_HOST; i++) {
      downloadPumps.push((phaseSignal, meter) => pump(`${hosts[h]}${OBJECT_PATH}`, phaseSignal, meter));
    }
  }
  const download = await measure(downloadPumps, signal, (live, loaded, samples, bytes) => {
    publish({
      phase: 'download',
      live,
      loaded,
      trend: { ...state.trend, download: samples },
      traffic: { ...state.traffic, download: bytes }
    });
  });
  publish({ results: { ...state.results, download: download.mbps } });

  const uploadPumps: Pump[] = [];
  for (let i = 0, count = mode === 'multi' ? UPLOAD_STREAMS : 1; i < count; i++) {
    uploadPumps.push((phaseSignal, meter) => push(UPLOAD_URL, phaseSignal, meter));
  }
  const upload = await measure(uploadPumps, signal, (live, loaded, samples, bytes) => {
    publish({
      phase: 'upload',
      live,
      loaded,
      trend: { ...state.trend, upload: samples },
      traffic: { ...state.traffic, upload: bytes }
    });
  });
  publish({ phase: 'done', live: 0, loaded: null, results: { ...state.results, upload: upload.mbps } });

  // Loaded latencies may still be waiting on one ping each; they fill in without holding up the result.
  const [downloadLatency, uploadLatency] = await Promise.all([download.loadedLatency, upload.loadedLatency]);
  publish({ results: { ...state.results, downloadLatency, uploadLatency } });
}
