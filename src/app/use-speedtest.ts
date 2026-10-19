import { useEffect, useRef, useState } from 'react';
import { IDLE, runSpeedtest } from './engine';
import type { SpeedtestState, ThreadMode } from './engine';
import { MIN_DURATION, SAMPLE_INTERVAL } from './stability';
import { TARGETS } from './targets';
import type { Region } from './targets';

export type { Phase, Results, SpeedtestState, ThreadMode, Traffic, Trend } from './engine';
export type { Region } from './targets';

/** Samples a phase has produced by the minimum duration; the trend chart fills by then and compresses after. */
export const TREND_SAMPLES = Math.round(MIN_DURATION / SAMPLE_INTERVAL);

export function useSpeedtest(mode: ThreadMode, region: Region) {
  const [state, setState] = useState<SpeedtestState>(IDLE);
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
    runSpeedtest(mode, TARGETS[region], controller.signal, setState).catch(() => {
      // Stopped by the user, or the network gave out mid-test: keep whatever was measured.
      if (!controller.signal.aborted) setState((current) => ({ ...current, phase: 'done', live: 0, loaded: null }));
    });
  };

  return { ...state, start, stop };
}
