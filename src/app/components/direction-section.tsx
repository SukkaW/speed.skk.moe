'use client';

import * as stylex from '@stylexjs/stylex';
import { bp } from '../../styles/breakpoints.stylex';
import { useTarget } from '@/hooks/use-target';
import type { Target } from '@/lib/targets';

const styles = stylex.create({
  direction: {
    display: 'grid',
    gap: { default: 12, [bp.mobile]: 10, [bp.large]: 16 },
    transitionProperty: 'opacity',
    transitionDuration: '150ms'
  },
  // The direction has no endpoint in the chosen region; the cards stay so the layout does not shift.
  directionMuted: { opacity: 0.45 }
});

interface DirectionSectionProps {
  direction: 'download' | 'upload',
  targets: readonly Target[],
  children: React.ReactNode
}

export function DirectionSection({ direction, targets, children }: DirectionSectionProps) {
  const target = useTarget(targets);
  const muted = direction === 'upload' && target.upload.length === 0;
  return <section {...stylex.props(styles.direction, muted && styles.directionMuted)}>{children}</section>;
}
