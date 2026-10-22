import { useCallback, useEffect, useRef } from 'react';
import { useSetDownload, useSetJitter, useSetLatency, useSetPhase, useSetUpload } from '@/context/speedtest';
import { NOT_STARTED, runSpeedtest } from '@/lib/engine';
import type { Phase, ThreadMode } from '@/lib/engine';
import { MIN_DURATION, SAMPLE_INTERVAL } from '@/lib/stability';
import type { Target } from '@/lib/targets';

export type { Phase, ThreadMode, Throughput } from '@/lib/engine';

/** Samples a phase has produced by the minimum duration; the trend chart fills by then and compresses after. */
export const TREND_SAMPLES = Math.round(MIN_DURATION / SAMPLE_INTERVAL);

/** Starts and stops runs, reporting their figures through the contexts; one caller owns the run. */
export function useSpeedtestControls(mode: ThreadMode, target: Target) {
  const setPhase = useSetPhase();
  const setLatency = useSetLatency();
  const setJitter = useSetJitter();
  const setDownload = useSetDownload();
  const setUpload = useSetUpload();
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const clear = useCallback((phase: Phase) => {
    setPhase(phase);
    setLatency(null);
    setJitter(null);
    setDownload(NOT_STARTED);
    setUpload(NOT_STARTED);
  }, [setPhase, setLatency, setJitter, setDownload, setUpload]);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    clear('idle');
  }, [clear]);

  const start = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    clear('latency');
    const report = { phase: setPhase, latency: setLatency, jitter: setJitter, download: setDownload, upload: setUpload };
    runSpeedtest(mode, target, controller.signal, report).catch(() => {
      // Stopped by the user, or the network gave out mid-test: keep whatever was measured.
      if (!controller.signal.aborted) setPhase('done');
    });
  }, [mode, target, clear, setPhase, setLatency, setJitter, setDownload, setUpload]);

  return { start, stop };
}
