import { useEffect, useRef } from 'react';
import { useSetSpeedtestState } from '@/context/speedtest';
import { IDLE, runSpeedtest } from '@/lib/engine';
import type { ThreadMode } from '@/lib/engine';
import { MIN_DURATION, SAMPLE_INTERVAL } from '@/lib/stability';
import type { Target } from '@/lib/targets';

export type { Phase, Results, SpeedtestState, ThreadMode, Traffic, Trend } from '@/lib/engine';

/** Samples a phase has produced by the minimum duration; the trend chart fills by then and compresses after. */
export const TREND_SAMPLES = Math.round(MIN_DURATION / SAMPLE_INTERVAL);

/** Starts and stops runs, publishing their state through the context; one caller owns the run. */
export function useSpeedtestControls(mode: ThreadMode, target: Target) {
  const setState = useSetSpeedtestState();
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const stop = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState(IDLE);
  };

  const start = () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    runSpeedtest(mode, target, controller.signal, setState).catch(() => {
      // Stopped by the user, or the network gave out mid-test: keep whatever was measured.
      if (!controller.signal.aborted) setState((current) => ({ ...current, phase: 'done', live: 0, loaded: null }));
    });
  };

  return { start, stop };
}
