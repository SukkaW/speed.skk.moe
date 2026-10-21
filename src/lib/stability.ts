/**
 * Adaptive test duration. Throughput is sampled at a fixed cadence; the phase ends once a
 * windowed estimate has held steady, or at the cap. The last estimate is the phase result:
 * it is the value the stop rule validated, so the result never jumps away from the live
 * reading, and on a link that bursts then throttles it reports the sustained rate rather
 * than a whole-run average. Pure functions over the sample arrays so the real engine can
 * feed them bytes-per-interval readings unchanged.
 */

/** Seconds between throughput samples. */
export const SAMPLE_INTERVAL = 0.1;
/** Seconds ignored at the start of a phase while TCP slow start ramps up. */
export const WARMUP = 1.5;
export const MIN_DURATION = 7;
export const MAX_DURATION = 15;

/** Seconds of samples behind each stability estimate. */
const WINDOW = 3;
/** Share of the window's samples dropped from each end before averaging. */
const TRIM = 0.1;
/** Seconds of samples behind the reported rate. */
const RESULT_WINDOW = 5;
/**
 * Shares of the result window dropped as stalls and bursts. The slow side is cut deeper because
 * request turnover (a stream finishing, the next ramping up) leaves brief low samples that say
 * nothing about the link. The chart trims the same shares over a shorter window, so on a steady
 * link the reference line sits on the curve and only lags it when the link moves.
 */
const RESULT_TRIM_SLOW = 0.2;
const RESULT_TRIM_FAST = 0.1;
/** Seconds of samples behind each point of the chart. */
const CHART_WINDOW = 2;
const CHART_TRIM_SLOW = RESULT_TRIM_SLOW;
const CHART_TRIM_FAST = RESULT_TRIM_FAST;
/** Seconds the estimate must stay within TOLERANCE of its latest value. */
const STABLE_FOR = 2;
const TOLERANCE = 0.04;

const toCount = (seconds: number) => Math.round(seconds / SAMPLE_INTERVAL);

/**
 * Mean with a share of the slowest and fastest samples dropped. Real links deliver in bursts,
 * so 100 ms samples are bimodal; a median sits below the true rate there while a trimmed mean
 * tracks it and still ignores stray spikes and stalls.
 */
function trimmedMean(values: readonly number[], slow: number, fast: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const kept = sorted.slice(Math.floor(sorted.length * slow), sorted.length - Math.floor(sorted.length * fast));
  let sum = 0;
  for (let i = 0, len = kept.length; i < len; i++) sum += kept[i];
  return sum / kept.length;
}

/** Symmetric trimmed mean of the post-warm-up samples in the trailing window; what the stop rule watches. */
export function estimate(samples: readonly number[]): number {
  const from = Math.max(toCount(WARMUP), samples.length - toCount(WINDOW));
  if (from >= samples.length) return samples.at(-1) ?? 0;
  return trimmedMean(samples.slice(from), TRIM, TRIM);
}

/**
 * The rate to report: the last few seconds with stalls and bursts discarded. Drawn across the
 * chart as a reference line while the phase runs, so the curve's dips below it and humps above
 * it read as what the figure leaves out. Zero until the warm-up has passed.
 */
export function sustained(samples: readonly number[]): number {
  const from = Math.max(toCount(WARMUP), samples.length - toCount(RESULT_WINDOW));
  if (from >= samples.length) return 0;
  return trimmedMean(samples.slice(from), RESULT_TRIM_SLOW, RESULT_TRIM_FAST);
}

/** The chart's view of the link: a short window that still shows a genuine slowdown, minus the turnover dips. */
export function smoothed(samples: readonly number[]): number {
  if (samples.length === 0) return 0;
  return trimmedMean(samples.slice(-toCount(CHART_WINDOW)), CHART_TRIM_SLOW, CHART_TRIM_FAST);
}

/** One estimate is appended per sample, so its length is the elapsed time. */
export function shouldStop(estimates: readonly number[]): boolean {
  const count = estimates.length;
  if (count >= toCount(MAX_DURATION)) return true;
  if (count < toCount(MIN_DURATION)) return false;

  const latest = estimates.at(-1) ?? 0;
  if (latest <= 0) return false;
  return estimates
    .slice(count - toCount(STABLE_FOR))
    .every((value) => Math.abs(value - latest) / latest < TOLERANCE);
}
