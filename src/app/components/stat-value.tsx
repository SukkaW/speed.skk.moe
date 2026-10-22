'use client';

import * as stylex from '@stylexjs/stylex';
import { prettyTraffic } from 'xbits';
import { useSpeedtestState } from '@/context/speedtest';
import type { SpeedtestState } from '@/lib/engine';
import { splitUnit } from '@/lib/split-unit';
import { bp } from '../../styles/breakpoints.stylex';
import { colors, fonts } from '../../styles/tokens.stylex';

const styles = stylex.create({
  statValue: {
    display: 'block',
    marginTop: { default: 6, [bp.mobile]: 4, [bp.large]: 10 },
    fontFamily: fonts.condensed,
    fontSize: { default: 32, [bp.mobile]: 28, [bp.large]: 44 },
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums',
    color: colors.ink
  },
  statValueCompact: {
    marginTop: 4,
    fontSize: { default: 26, [bp.mobile]: 24, [bp.large]: 28 }
  },
  statUnit: {
    marginLeft: 6,
    fontFamily: fonts.sans,
    fontSize: { default: 14, [bp.large]: 16 },
    fontWeight: 400,
    letterSpacing: 0,
    color: colors.inkMuted
  },
  empty: { color: colors.inkFaint }
});

const wholeNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function formatOrDash(value: number | null, format: Intl.NumberFormat) {
  return value == null ? null : format.format(value);
}

export type StatKey = 'latency' | 'jitter' | 'downloadLatency' | 'uploadLatency' | 'downloaded' | 'uploaded';

/** Live reading while its phase runs, the settled result otherwise. */
function read(stat: StatKey, { latency, jitter, download, upload }: SpeedtestState): { value: string | null, unit: string } {
  switch (stat) {
    case 'latency':
      return { value: formatOrDash(latency, wholeNumber), unit: 'ms' };
    case 'jitter':
      return { value: formatOrDash(jitter, oneDecimal), unit: 'ms' };
    case 'downloadLatency':
      return { value: formatOrDash(download.latency, wholeNumber), unit: 'ms' };
    case 'uploadLatency':
      return { value: formatOrDash(upload.latency, wholeNumber), unit: 'ms' };
    case 'downloaded':
      return splitUnit(prettyTraffic(download.bytes));
    case 'uploaded':
      return splitUnit(prettyTraffic(upload.bytes));
    // no default
  }
}

interface StatValueProps {
  stat: StatKey,
  compact?: boolean
}

export function StatValue({ stat, compact }: StatValueProps) {
  const { value, unit } = read(stat, useSpeedtestState());
  return (
    <dd {...stylex.props(styles.statValue, compact && styles.statValueCompact, value == null && styles.empty)}>
      {value ?? '—'}
      <span {...stylex.props(styles.statUnit)}>{unit}</span>
    </dd>
  );
}
