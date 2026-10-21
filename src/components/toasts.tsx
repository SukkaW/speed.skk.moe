'use client';

import { Toaster } from 'sonner';
import { useColorScheme } from '@/context/color-scheme-provider';
import { colors, fonts } from '../styles/tokens.stylex';

const style = {
  fontFamily: fonts.sans,
  '--normal-bg': colors.raised,
  '--normal-text': colors.ink,
  '--normal-border': colors.line,
  '--border-radius': '12px'
} as React.CSSProperties;

/** Follows the appearance menu rather than the system scheme alone. */
export function Toasts() {
  return <Toaster theme={useColorScheme()} position="bottom-center" style={style} />;
}
