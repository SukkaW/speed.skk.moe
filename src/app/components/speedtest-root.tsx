'use client';

import * as stylex from '@stylexjs/stylex';
import { useSetRoot } from '@/context/speedtest';
import { bp } from '../../styles/breakpoints.stylex';

const styles = stylex.create({
  grid: {
    display: 'grid',
    gap: { default: 12, [bp.mobile]: 10, [bp.large]: 16 },
    width: '100%',
    maxWidth: 1120
  }
});

/** The captured block; the element is published so the screenshot button can reach it. */
export function SpeedtestRoot({ children }: React.PropsWithChildren) {
  return <div ref={useSetRoot()} {...stylex.props(styles.grid)}>{children}</div>;
}
