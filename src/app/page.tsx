import * as stylex from '@stylexjs/stylex';
import { CurrentYear } from 'foxact/current-year';
import { Speedtest } from './components/speedtest';
import { loadTargets } from '@/lib/targets';
import { bp } from '../styles/breakpoints.stylex';
import { colors } from '../styles/tokens.stylex';

const PAGE_PADDING = 'clamp(20px, 4vw, 40px)';

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
  // Aligns with the info row above it.
  footer: {
    width: '100%',
    maxWidth: 1120,
    marginTop: { default: 24, [bp.mobile]: 16, [bp.large]: 32 },
    paddingInline: { default: 16, [bp.mobile]: 12, [bp.large]: 24 },
    fontSize: { default: 13, [bp.large]: 14 },
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
  },
  linkIcon: {
    width: '1em',
    height: '1em',
    marginRight: 4,
    verticalAlign: '-0.125em'
  }
});

export default function Home() {
  const targets = loadTargets();

  return (
    <main {...stylex.props(styles.main)}>
      <Speedtest targets={targets} />
      <footer {...stylex.props(styles.footer)}>
        &copy;
        {' '}
        <CurrentYear defaultYear={2026} />
        {' '}
        speed.skk.moe. All rights reserved
        <span aria-hidden {...stylex.props(styles.separator)}>|</span>
        Made by
        {' '}
        {/* eslint-disable-next-line @eslint-react/dom-no-unsafe-target-blank -- our own site; the referrer is wanted */}
        <a href="https://skk.moe" target="_blank" {...stylex.props(styles.footerLink)}>Sukka</a>
        <span aria-hidden {...stylex.props(styles.separator)}>|</span>
        <a href="https://github.com/SukkaW/speed.skk.moe" target="_blank" rel="noreferrer noopener" {...stylex.props(styles.footerLink)}>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...stylex.props(styles.linkIcon)}>
            <path fillRule="evenodd" clipRule="evenodd" d="M12.03 2a9.97 9.97 0 0 0-3.16 19.44c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.91-.61.06-.6.06-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.33 1.08 2.9.83.1-.65.35-1.09.64-1.34-2.22-.25-4.55-1.1-4.55-4.93 0-1.08.4-1.98 1.03-2.67-.1-.26-.45-1.27.1-2.64 0 0 .83-.27 2.74 1.02a9.58 9.58 0 0 1 2.5-.34 9.55 9.55 0 0 1 2.5.34c1.9-1.3 2.73-1.02 2.73-1.02.55 1.37.2 2.38.1 2.64.64.7 1.03 1.58 1.03 2.67 0 3.84-2.33 4.68-4.56 4.92.36.31.68.92.68 1.85l-.01 2.74c0 .26.18.57.68.48A9.98 9.98 0 0 0 12.03 2z" />
          </svg>
          Source Code
        </a>
      </footer>
    </main>
  );
}
