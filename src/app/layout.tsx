import type { Metadata, Viewport } from 'next';
import type { WebApplication, WithContext } from 'schema-dts';
import { Barlow, Barlow_Semi_Condensed } from 'next/font/google';
import * as stylex from '@stylexjs/stylex';
import { stylexPropsWithClassName } from 'stylex-webpack/utils';
import 'minireset.css';
import '@/styles/globals.css';
import 'stylex-webpack/stylex.css';
import { colors, fonts } from '../styles/tokens.stylex';
import { ThemeScript } from '@/components/theme-script';
import { ColorSchemeProvider } from '@/context/color-scheme-provider';
import { Toasts } from '@/components/toasts';

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

const SITE_NAME = 'Speedtest | Sukka';
const APP_NAME = 'speed.skk.moe';
const DESCRIPTION = 'Measure your download and upload speed, latency and jitter.';

const jsonLd: WithContext<WebApplication> = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: APP_NAME,
  url: 'https://speed.skk.moe/',
  description: DESCRIPTION,
  image: 'https://cdn.skk.moe/favicon/android-chrome-512x512.png',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  isAccessibleForFree: true,
  author: {
    '@type': 'Person',
    name: 'Sukka',
    url: 'https://skk.moe'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export const metadata: Metadata = {
  metadataBase: new URL('https://speed.skk.moe'),
  title: SITE_NAME,
  description: DESCRIPTION,
  applicationName: APP_NAME,
  authors: [{ name: 'Sukka', url: 'https://skk.moe' }],
  creator: 'Sukka',
  icons: {
    shortcut: {
      type: 'image/ico',
      url: 'https://cdn.skk.moe/favicon.ico'
    },
    icon: [
      {
        type: 'image/ico',
        sizes: 'any',
        rel: 'icon',
        url: 'https://cdn.skk.moe/favicon.ico'
      },
      {
        type: 'image/svg+xml',
        rel: 'icon',
        url: 'https://cdn.skk.moe/avatar/sketch-rounded.svg'
      },
      {
        type: 'image/png',
        sizes: '512x512',
        rel: 'icon',
        url: 'https://cdn.skk.moe/favicon/android-chrome-512x512.png'
      },
      {
        type: 'image/png',
        sizes: '192x192',
        rel: 'icon',
        url: 'https://cdn.skk.moe/favicon/android-chrome-192x192.png'
      }
    ],
    apple: {
      type: 'image/png',
      sizes: '180x180',
      url: 'https://cdn.skk.moe/favicon/apple-touch-icon.png'
    }
  },
  formatDetection: {
    telephone: false
  },
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: 'default'
  },
  openGraph: {
    type: 'website',
    url: 'https://speed.skk.moe/',
    title: SITE_NAME,
    siteName: APP_NAME,
    description: DESCRIPTION,
    images: {
      url: 'https://cdn.skk.moe/favicon/android-chrome-512x512.png',
      width: 512,
      height: 512
    }
  },
  twitter: {
    card: 'summary',
    site: '@isukkaw',
    creator: '@isukkaw'
  },
  robots: {
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1
  },
  other: {
    'fediverse:creator': '@sukka@acg.mn'
  }
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning {...stylexPropsWithClassName(stylex.props(styles.html), barlow.variable, barlowSemiCondensed.variable)}>
      <body suppressHydrationWarning {...stylex.props(styles.body)}>
        <ThemeScript />
        <ColorSchemeProvider>
          {children}
          <Toasts />
        </ColorSchemeProvider>
        <script
          type="application/ld+json"
          // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- json ld
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
