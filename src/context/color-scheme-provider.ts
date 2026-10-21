'use client';

import { useCallback, useRef } from 'react';
import { createContextState } from 'foxact/context-state';
import { cancelIdleCallback, requestIdleCallback } from 'foxact/request-idle-callback';
import { THEME_COLOR, THEME_STORAGE_KEY } from '@/lib/theme';
import type { ColorScheme } from '@/lib/theme';

function applyToDom(scheme: ColorScheme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (scheme !== 'system') root.classList.add(scheme);

  const resolved = scheme === 'system'
    // eslint-disable-next-line vibe-proof/react-prefer-foxact-use-media-query -- one-shot read outside render, nothing to subscribe to
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : scheme;
  document.querySelectorAll('meta[name="theme-color"]').forEach((el) => {
    el.setAttribute('content', THEME_COLOR[resolved]);
  });
}

function readStored(): ColorScheme {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    }
  } catch {}
  return 'system';
}

const [ColorSchemeProvider, useColorScheme, useSetColorSchemeState] = createContextState<ColorScheme>(readStored());

export function useSetColorScheme() {
  const setState = useSetColorSchemeState();
  const idleRef = useRef<number | null>(null);

  return useCallback((scheme: ColorScheme) => {
    setState(scheme);
    applyToDom(scheme);

    if (idleRef.current !== null) cancelIdleCallback(idleRef.current);
    idleRef.current = requestIdleCallback(() => {
      try {
        if (scheme === 'system') {
          localStorage.removeItem(THEME_STORAGE_KEY);
        } else {
          localStorage.setItem(THEME_STORAGE_KEY, scheme);
        }
      } finally {
        idleRef.current = null;
      }
    });
  }, [setState]);
}

export { ColorSchemeProvider, useColorScheme };
