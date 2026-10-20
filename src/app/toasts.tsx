'use client';

import { Toaster } from 'sonner';
import { useColorScheme } from './color-scheme-provider';
import { colors, fonts } from './tokens.stylex';

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
