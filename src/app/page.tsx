import * as stylex from '@stylexjs/stylex';
import { CurrentYear } from 'foxact/current-year';
import { Speedtest } from './speedtest';
import { ThemeMenu } from './theme-menu';
import { colors, fonts } from './tokens.stylex';

const PAGE_PADDING = 'clamp(20px, 4vw, 40px)';
const MOBILE = '@media (max-width: 639px)';
const LARGE = '@media (min-width: 1024px)';

const styles = stylex.create({
  main: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: PAGE_PADDING,
    paddingRight: PAGE_PADDING,
    paddingBottom: PAGE_PADDING,
    paddingLeft: PAGE_PADDING
  },
  wordmark: {
    fontFamily: fonts.condensed,
    fontSize: { default: 22, [LARGE]: 28 },
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap'
  },
  wordmarkDomain: { color: colors.inkMuted },
  // Aligns with the info row above it.
  footer: {
    width: '100%',
    maxWidth: 1120,
    marginTop: { default: 24, [MOBILE]: 16, [LARGE]: 32 },
    paddingInline: { default: 16, [MOBILE]: 12, [LARGE]: 24 },
    fontSize: { default: 13, [LARGE]: 14 },
    lineHeight: 1.3,
    color: colors.inkMuted
  },
  separator: {
    marginInline: 8,
    color: colors.inkFaint
  },
  footerLink: {
    color: colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: { default: colors.line, ':hover': colors.ink },
    textUnderlineOffset: 3,
    transitionProperty: 'text-decoration-color',
    transitionDuration: '150ms'
  }
});

export default function Home() {
  return (
    <main {...stylex.props(styles.main)}>
      <Speedtest
        wordmark={(
          <h1 {...stylex.props(styles.wordmark)}>
            speed<span {...stylex.props(styles.wordmarkDomain)}>.skk.moe</span>
          </h1>
        )}
        appearance={<ThemeMenu />}
      />
      <footer {...stylex.props(styles.footer)}>
        © <CurrentYear defaultYear={2026} /> speed.skk.moe. All rights reserved
        <span aria-hidden {...stylex.props(styles.separator)}>|</span>
        Made by
        {' '}
        {/* eslint-disable-next-line @eslint-react/dom-no-unsafe-target-blank -- our own site; the referrer is wanted */}
        <a href="https://skk.moe" target="_blank" {...stylex.props(styles.footerLink)}>Sukka</a>.
      </footer>
    </main>
  );
}
