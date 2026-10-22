import { useCallback, useEffect, useRef } from 'react';
import { useSetSpeedtestState } from '@/context/speedtest';
import { IDLE, interrupted, runSpeedtest } from '@/lib/engine';
import type { ThreadMode } from '@/lib/engine';
import { MIN_DURATION, SAMPLE_INTERVAL } from '@/lib/stability';
import type { Target } from '@/lib/targets';

export type { Phase, SpeedtestState, ThreadMode, Throughput } from '@/lib/engine';

/** Samples a phase has produced by the minimum duration; the trend chart fills by then and compresses after. */
export const TREND_SAMPLES = Math.round(MIN_DURATION / SAMPLE_INTERVAL);

/** Starts and stops runs, publishing their state through the context; one caller owns the run. */
export function useSpeedtestControls(mode: ThreadMode, target: Target) {
  const setState = useSetSpeedtestState();
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState(IDLE);
  }, [setState]);

  const start = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    runSpeedtest(mode, target, controller.signal, setState).catch(() => {
      // Stopped by the user, or the network gave out mid-test: keep whatever was measured.
      if (!controller.signal.aborted) setState(interrupted);
    });
  }, [mode, target, setState]);

  return { start, stop };
}
