export type Region = 'global' | 'china';

export interface Target {
  /**
   * One-byte range requests, idle and under load. The host must allow CORS and ranges;
   * Timing-Allow-Origin lets the timing come from Resource Timing instead of the wall clock.
   */
  ping: string,
  /** Throughput objects, one per host so multi-thread spreads across connections. The first also serves single-thread. */
  download: readonly string[],
  /** POST sink; null skips the upload phase. */
  upload: string | null
}

// Served as an image so the CDN never brotli-compresses it on the fly, which would cap throughput.
const OBJECT_PATH = '/redacted/object';
// Each host is its own HTTP/2 connection, so multi-thread spreads across mirrors instead of
// multiplexing onto one connection's congestion window.
const MIRRORS = [
  'https://redacted-mirror-1.invalid',
  'https://redacted-mirror-2.invalid',
  'https://redacted-mirror-3.invalid',
  'https://redacted-mirror-4.invalid',
  'https://redacted-mirror-5.invalid'
];

export const TARGETS: Record<Region, Target> = {
  global: {
    ping: `${MIRRORS[0]}${OBJECT_PATH}`,
    download: MIRRORS.map((host) => `${host}${OBJECT_PATH}`),
    // Accepts and discards POST bodies. Served over HTTP/1.1, so every stream is its own TCP connection.
    upload: 'https://redacted-upload.invalid/sink'
  },
  china: {
    // Too small for throughput, but the quickest first byte of these hosts and the only one with Timing-Allow-Origin.
    ping: 'https://redacted-ping.invalid/object',
    download: [
      'https://redacted-download-1.invalid/object',
      'https://redacted-download-2.invalid/object'
    ],
    upload: null
  }
};
