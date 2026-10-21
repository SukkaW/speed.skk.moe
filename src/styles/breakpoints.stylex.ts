import * as stylex from '@stylexjs/stylex';

/**
 * Two structural breakpoints: phones stack and go two-up, large screens get the roomier spacing
 * and type. Lives in a `.stylex.ts` file so the StyleX compiler can inline the values.
 */
export const bp = stylex.defineConsts({
  mobile: '@media (max-width: 639px)',
  large: '@media (min-width: 1024px)'
});
