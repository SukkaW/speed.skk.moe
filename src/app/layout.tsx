import type { Metadata } from 'next';
import { Barlow, Barlow_Semi_Condensed } from 'next/font/google';
import * as stylex from '@stylexjs/stylex';
import { stylexPropsWithClassName } from 'stylex-webpack/utils';
import 'minireset.css';
import './globals.css';
import 'stylex-webpack/stylex.css';
import { colors, fonts } from './tokens.stylex';
import { THEME_COLOR } from './theme';
import { ThemeScript } from './theme-script';
import { ColorSchemeProvider } from './color-scheme-provider';

const barlow = Barlow({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-barlow', display: 'swap' });
const barlowSemiCondensed = Barlow_Semi_Condensed({ subsets: ['latin'], weight: ['500'], variable: '--font-barlow-semi-condensed', display: 'swap' });

const styles = stylex.create({
  html: {
    backgroundColor: colors.surface
  },
  body: {
    minHeight: '100dvh',
    backgroundColor: colors.surface,
    color: colors.ink,
    fontFamily: fonts.sans
  }
});

export const metadata: Metadata = {
  title: 'speed.skk.moe',
  description: 'Test your download speed, upload speed and latency.'
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning {...stylexPropsWithClassName(stylex.props(styles.html), barlow.variable, barlowSemiCondensed.variable)}>
      <head>
        <meta name="theme-color" content={THEME_COLOR.light} />
      </head>
      <body suppressHydrationWarning {...stylex.props(styles.body)}>
        <ThemeScript />
        <ColorSchemeProvider>{children}</ColorSchemeProvider>
      </body>
    </html>
  );
}
