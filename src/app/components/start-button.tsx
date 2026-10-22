'use client';

import * as stylex from '@stylexjs/stylex';
import { Button } from '@base-ui/react/button';
import { useMode, usePhase, useRunning } from '@/context/speedtest';
import { useGeo } from '@/hooks/use-geo';
import { useSpeedtestControls } from '@/hooks/use-speedtest';
import { useTarget } from '@/hooks/use-target';
import type { Target } from '@/lib/targets';
import { bp } from '../../styles/breakpoints.stylex';
import { colors } from '../../styles/tokens.stylex';

const styles = stylex.create({
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexShrink: 0,
    minWidth: { default: 140, [bp.mobile]: 0 },
    minHeight: 44,
    paddingInline: { default: 24, [bp.mobile]: 18, [bp.large]: 32 },
    borderRadius: 12,
    borderStyle: 'none',
    backgroundColor: {
      default: colors.ink,
      ':hover': `color-mix(in srgb, ${colors.ink} 86%, ${colors.surface})`
    },
    color: colors.surface,
    fontFamily: 'inherit',
    fontSize: { default: 15, [bp.large]: 17 },
    fontWeight: 500,
    cursor: { default: 'pointer', ':disabled': 'default' },
    opacity: { default: 1, ':disabled': 0.55 },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: colors.ink,
    outlineOffset: 3,
    transitionProperty: 'background-color, color, box-shadow',
    transitionDuration: '150ms'
  },
  buttonQuiet: {
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.control
    },
    color: colors.ink,
    boxShadow: `inset 0 0 0 1px ${colors.line}`
  }
});

interface StartButtonProps {
  targets: readonly Target[],
  idleSlot: React.ReactNode,
  runningSlot: React.ReactNode,
  doneSlot: React.ReactNode
}

export function StartButton({ targets, idleSlot, runningSlot, doneSlot }: StartButtonProps) {
  const phase = usePhase();
  const running = useRunning();
  // The region is not settled until the lookup has answered.
  const { isLoading: locating } = useGeo();
  const { start, stop } = useSpeedtestControls(useMode(), useTarget(targets));
  return (
    <Button
      disabled={locating}
      onClick={running ? stop : start}
      {...stylex.props(styles.button, running && styles.buttonQuiet)}
    >
      {phase === 'idle' && idleSlot}
      {running && runningSlot}
      {phase === 'done' && doneSlot}
    </Button>
  );
}
