'use client';

import { createContextState } from 'foxact/context-state';
import { IDLE } from '@/lib/engine';
import type { SpeedtestState, ThreadMode } from '@/lib/engine';
import type { Target } from '@/lib/targets';

// Destructured bindings are re-exported by name below: Next only turns plain named exports of a
// client module into client references, so `export const [A, B] = …` reaches a server component as undefined.

/** Live readings and results of the current run; written by the start button, read by every value. */
const [SpeedtestStateProvider, useSpeedtestState, useSetSpeedtestState] = createContextState<SpeedtestState>(IDLE);

export function useRunning() {
  const { phase } = useSpeedtestState();
  return phase !== 'idle' && phase !== 'done';
}

const [ModeProvider, useMode, useSetMode] = createContextState<ThreadMode>('multi');

/** A region picked by hand; null follows the geo lookup. */
const [ChoiceProvider, useChoice, useSetChoice] = createContextState<Target | null>(null);

/** Screenshot mode: personal details are masked and the location drops to the country. */
const [RedactedProvider, useRedacted, useSetRedacted] = createContextState(false);

const [CapturingProvider, useCapturing, useSetCapturing] = createContextState(false);

/** The block a screenshot captures. */
const [RootProvider, useRoot, useSetRoot] = createContextState<HTMLDivElement | null>(null);

export {
  SpeedtestStateProvider, useSpeedtestState, useSetSpeedtestState,
  ModeProvider, useMode, useSetMode,
  ChoiceProvider, useChoice, useSetChoice,
  RedactedProvider, useRedacted, useSetRedacted,
  CapturingProvider, useCapturing, useSetCapturing,
  RootProvider, useRoot, useSetRoot
};
