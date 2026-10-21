export type ColorScheme = 'system' | 'light' | 'dark';

/** localStorage key holding an explicit choice; absent means follow the system. */
export const THEME_STORAGE_KEY = 'color-scheme';

/** `theme-color` for the browser chrome. Mirrors `colors.surface` in tokens.stylex.ts. */
export const THEME_COLOR = {
  light: '#F5F6F8',
  dark: '#121419'
} as const;
