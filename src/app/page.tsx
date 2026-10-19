import * as stylex from '@stylexjs/stylex';
import { Speedtest } from './speedtest';
import { ThemeMenu } from './theme-menu';
import { colors, fonts } from './tokens.stylex';

const PAGE_PADDING = 'clamp(20px, 4vw, 40px)';

const styles = stylex.create({
  main: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: PAGE_PADDING,
    paddingRight: PAGE_PADDING,
    paddingBottom: PAGE_PADDING,
    paddingLeft: PAGE_PADDING
  },
  wordmark: {
    fontFamily: fonts.condensed,
    fontSize: { default: 22, '@media (min-width: 1024px)': 28 },
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap'
  },
  wordmarkDomain: { color: colors.inkMuted }
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
    </main>
  );
}
