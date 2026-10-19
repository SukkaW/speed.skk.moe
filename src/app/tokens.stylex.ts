import * as stylex from '@stylexjs/stylex';

// Every colour resolves through `color-scheme` on <html>: the OS preference by default,
// or the `.light` / `.dark` class the appearance menu applies (see globals.css).
export const colors = stylex.defineVars({
  surface: 'light-dark(#F5F6F8, #121419)',
  raised: 'light-dark(#FFFFFF, #1A1D24)',
  ink: 'light-dark(#15181F, #ECEEF2)',
  inkMuted: 'light-dark(#5B6270, #969CAA)',
  inkFaint: 'light-dark(#A3A9B5, #5E6473)',
  line: 'light-dark(#DDE1E7, #2A2E37)',
  control: 'light-dark(#E7EAEF, #2B303A)',
  download: 'light-dark(#2F6FE4, #5B8DEF)',
  upload: 'light-dark(#C8731A, #C97C26)'
});

export const fonts = stylex.defineVars({
  sans: 'var(--font-barlow), system-ui, sans-serif',
  condensed: 'var(--font-barlow-semi-condensed), var(--font-barlow), system-ui, sans-serif'
});
