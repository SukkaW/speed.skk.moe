import 'server-only';
import { nullthrow } from 'foxts/guard';
import { isObjectEmpty } from 'foxts/is-object-empty';
import { z } from 'zod';

const url = z.url();

const targetSchema = z.object({
  /** ISO 3166-1 alpha-2 codes whose visitors default to this target. */
  countries: z.array(z.string().length(2)).default([]),
  /** HEAD requests go here, idle and under load; defaults to the first download object. */
  ping: url.optional(),
  /** Large objects, one per host so multi-thread spreads across connections. */
  download: z.array(url).min(1),
  /** POST sinks that discard the body; null skips the upload phase. */
  upload: z.array(url).nullable().default(null)
});

/** Keyed by region label, in menu order; the first entry is the default. */
const targetsSchema = z
  .record(z.string().min(1), targetSchema)
  .refine((entries) => !isObjectEmpty(entries), 'At least one target is required');

export interface Target {
  name: string,
  countries: readonly string[],
  ping: string,
  download: readonly string[],
  /** Empty when the region has no sink; the upload phase is skipped. */
  upload: readonly string[]
}

/** Parsed once per build from SPEEDTEST_TARGETS, which never reaches the client bundle. */
export function loadTargets(): readonly Target[] {
  const raw = nullthrow(process.env.SPEEDTEST_TARGETS, 'Missing SPEEDTEST_TARGETS');
  const result = targetsSchema.safeParse(JSON.parse(raw));
  if (!result.success) throw new TypeError(`Invalid SPEEDTEST_TARGETS: ${z.prettifyError(result.error)}`);
  return Object.entries(result.data).map(([name, target]) => ({
    name,
    countries: target.countries,
    ping: target.ping ?? target.download[0],
    download: target.download,
    upload: target.upload ?? []
  }));
}
