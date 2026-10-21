'use client';

import * as stylex from '@stylexjs/stylex';
import { prettyBandwidth } from 'xbits';
import { useSpeedtestState } from '@/context/speedtest';
import { splitUnit } from '@/lib/split-unit';
import { bp } from '../../styles/breakpoints.stylex';
import { colors, fonts } from '../../styles/tokens.stylex';
import { TrendChart } from './trend-chart';
import { TREND_SAMPLES } from '@/hooks/use-speedtest';

const styles = stylex.create({
  panelValue: {
    fontFamily: fonts.condensed,
    fontSize: {
      default: 'clamp(44px, 12vw, 64px)',
      [bp.mobile]: 'clamp(40px, 11vw, 48px)',
      [bp.large]: 'clamp(60px, 6vw, 88px)'
    },
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums',
    color: colors.ink
  },
  panelUnit: {
    marginLeft: 8,
    fontFamily: fonts.sans,
    fontSize: { default: 16, [bp.large]: 20 },
    fontWeight: 400,
    letterSpacing: 0,
    color: colors.inkMuted
  },
  panelChart: {
    height: { default: 112, [bp.mobile]: 80, [bp.large]: 'clamp(140px, 13vw, 200px)' },
    marginTop: { default: 6, [bp.mobile]: 4 },
    marginInline: { default: -20, [bp.mobile]: -16, [bp.large]: -28 }
  },
  empty: { color: colors.inkFaint }
});

/** Headline speed and trend of one direction: live while its phase runs, the result afterwards. */
export function SpeedReadout({ direction }: { direction: 'download' | 'upload' }) {
  const { phase, live, results, trend } = useSpeedtestState();
  const value = phase === direction ? live : results[direction];
  const samples = trend[direction];
  const speed = value == null ? null : splitUnit(prettyBandwidth(value * 1e6, { locale: 'en-US', minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  return (
    <>
      <p {...stylex.props(styles.panelValue, speed === null && styles.empty)}>
        {speed?.value ?? '—'}
        <span {...stylex.props(styles.panelUnit)}>{speed?.unit ?? 'Mbps'}</span>
      </p>
      <div {...stylex.props(styles.panelChart)}>
        <TrendChart samples={samples} capacity={Math.max(samples.length, TREND_SAMPLES)} tone={direction} />
      </div>
    </>
  );
}
