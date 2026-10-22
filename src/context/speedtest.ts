'use client';

import { createContextState } from 'foxact/context-state';
import { NOT_STARTED } from '@/lib/engine';
import type { Phase, ThreadMode, Throughput } from '@/lib/engine';

// Destructured bindings are re-exported by name below: Next only turns plain named exports of a
// client module into client references, so `export const [A, B] = …` reaches a server component as undefined.

// Live readings and results of the current run; written by the start button, read by every value.
// One context per figure, so a tick re-renders only the values it changed. The figures are read
// with `use(…Context)`, which may sit in a branch, so a value picks its source from a prop.
const [PhaseProvider, usePhase, useSetPhase] = createContextState<Phase>('idle');
/** Idle latency in ms: each ping while the latency phase runs, then the median. */
const [LatencyProvider, , useSetLatency, LatencyContext] = createContextState<number | null>(null);
const [JitterProvider, , useSetJitter, JitterContext] = createContextState<number | null>(null);
const [DownloadProvider, , useSetDownload, DownloadContext] = createContextState<Throughput>(NOT_STARTED);
const [UploadProvider, , useSetUpload, UploadContext] = createContextState<Throughput>(NOT_STARTED);

export function useRunning() {
  const phase = usePhase();
  return phase !== 'idle' && phase !== 'done';
}

const [ModeProvider, useMode, useSetMode] = createContextState<ThreadMode>('multi');

/** Index of a region picked by hand; null follows the geo lookup. */
const [ChoiceProvider, useChoice, useSetChoice] = createContextState<number | null>(null);

/** Screenshot mode: personal details are masked and the location drops to the country. */
const [RedactedProvider, useRedacted, useSetRedacted] = createContextState(false);

const [CapturingProvider, useCapturing, useSetCapturing] = createContextState(false);

/** The block a screenshot captures. */
const [RootProvider, useRoot, useSetRoot] = createContextState<HTMLDivElement | null>(null);

export {
  PhaseProvider, usePhase, useSetPhase,
  LatencyProvider, useSetLatency, LatencyContext,
  JitterProvider, useSetJitter, JitterContext,
  DownloadProvider, useSetDownload, DownloadContext,
  UploadProvider, useSetUpload, UploadContext,
  ModeProvider, useMode, useSetMode,
  ChoiceProvider, useChoice, useSetChoice,
  RedactedProvider, useRedacted, useSetRedacted,
  CapturingProvider, useCapturing, useSetCapturing,
  RootProvider, useRoot, useSetRoot
};
