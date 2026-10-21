import * as stylex from '@stylexjs/stylex';
import { ComposeContextProvider } from 'foxact/compose-context-provider';
import { CameraIcon, EyeIcon, EyeOffIcon, PlayIcon, RotateCwIcon, SquareIcon } from 'lucide-react';
import { Connections } from './connections';
import { DirectionSection } from './direction-section';
import { GeoValue } from './geo-value';
import { PrivacyToggle } from './privacy-toggle';
import { RegionMenu } from './region-menu';
import { ScreenshotButton } from './screenshot-button';
import { SpeedReadout } from './speed-readout';
import { CapturingProvider, ChoiceProvider, ModeProvider, RedactedProvider, RootProvider, SpeedtestStateProvider } from '@/context/speedtest';
import { SpeedtestRoot } from './speedtest-root';
import { StartButton } from './start-button';
import { StatValue } from './stat-value';
import type { StatKey } from './stat-value';
import { ThemeMenu } from '@/components/theme-menu';
import { bp } from '../../styles/breakpoints.stylex';
import { colors, fonts } from '../../styles/tokens.stylex';
import type { Target } from '@/lib/targets';

const styles = stylex.create({
  // Slim bar (wordmark, menu) on top; the toolbar wraps to its own full-width row beneath.
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: { default: 16, [bp.mobile]: 12, [bp.large]: 20 },
    marginBottom: { default: 4, [bp.large]: 8 }
  },
  wordmark: {
    fontFamily: fonts.condensed,
    fontSize: { default: 22, [bp.large]: 28 },
    fontWeight: 500,
    lineHeight: 1,
    // The face's ascent spans the whole em with the descent below it, so the lowercase glyphs
    // sit about 0.15em below the box centre; this lines them up with the header controls.
    transform: 'translateY(-0.13em)',
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap'
  },
  wordmarkDomain: { color: colors.inkMuted },
  menu: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto'
  },
  // Quarters line up with the four stat cards below; phones go two-up.
  toolbar: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(4, minmax(0, 1fr))',
      [bp.mobile]: 'repeat(2, minmax(0, 1fr))'
    },
    gap: { default: 12, [bp.mobile]: 10, [bp.large]: 16 },
    flexBasis: '100%'
  },
  directions: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2, minmax(0, 1fr))',
      [bp.mobile]: 'minmax(0, 1fr)'
    },
    gap: { default: 12, [bp.mobile]: 10, [bp.large]: 16 }
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: { default: 10, [bp.mobile]: 6, [bp.large]: 14 },
    paddingTop: { default: 20, [bp.mobile]: 16, [bp.large]: 28 },
    paddingInline: { default: 20, [bp.mobile]: 16, [bp.large]: 28 },
    borderRadius: { default: 16, [bp.large]: 20 },
    backgroundColor: colors.raised,
    overflow: 'hidden'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: { default: 14, [bp.large]: 15 },
    lineHeight: 1.25,
    color: colors.inkMuted
  },
  arrow: {
    width: 12,
    height: 12,
    flexShrink: 0
  },
  arrowDown: { color: colors.download },
  arrowUp: { color: colors.upload, transform: 'rotate(180deg)' },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: { default: 12, [bp.mobile]: 10, [bp.large]: 16 }
  },
  stat: {
    padding: { default: 16, [bp.mobile]: 12, [bp.large]: 24 },
    borderRadius: { default: 16, [bp.large]: 20 },
    backgroundColor: colors.raised
  },
  statCompact: {
    paddingBlock: { default: 10, [bp.large]: 14 },
    paddingInline: { default: 14, [bp.mobile]: 12, [bp.large]: 16 },
    borderRadius: 16
  },
  statFill: { height: '100%' },
  infoCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: { default: 14, [bp.mobile]: 12, [bp.large]: 18 },
    padding: { default: 16, [bp.mobile]: 12, [bp.large]: 24 },
    borderRadius: { default: 16, [bp.large]: 20 },
    backgroundColor: colors.raised
  },
  // Each item starts from the width its text needs and the leftover is shared out, so the row is
  // always filled; when IP and location leave no room, the whole provider item wraps to a second
  // line rather than any value being squeezed.
  info: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: { default: 'row', [bp.mobile]: 'column' },
    columnGap: { default: 32, [bp.large]: 48 },
    rowGap: { default: 12, [bp.mobile]: 8, [bp.large]: 16 }
  },
  infoItem: {
    flexGrow: 1,
    flexBasis: 'auto',
    maxWidth: '100%'
  },
  infoLabel: {
    fontSize: { default: 13, [bp.large]: 14 },
    lineHeight: 1.3,
    color: colors.inkMuted
  },
  footnote: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: { default: 12, [bp.mobile]: 10, [bp.large]: 14 },
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: `color-mix(in srgb, ${colors.line} 50%, transparent)`,
    fontSize: { default: 13, [bp.large]: 14 },
    lineHeight: 1.3,
    color: colors.inkMuted
  },
  footnoteLink: {
    color: colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: { default: colors.line, ':hover': colors.ink },
    textUnderlineOffset: 3,
    transitionProperty: 'text-decoration-color',
    transitionDuration: '150ms'
  },
  hidden: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingInline: 8,
    borderRadius: 999,
    backgroundColor: colors.control,
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: 500,
    verticalAlign: 'middle'
  }
});

/** Stands in for a masked value so a screenshot reads as deliberate redaction. */
const hiddenJsx = (
  <span {...stylex.props(styles.hidden)}>
    <EyeOffIcon size={12} strokeWidth={1.8} aria-hidden />
    Hidden
  </span>
);

/** One `createContextState` per concern, so a leaf re-renders only for the state it reads. */
const contexts = [
  <SpeedtestStateProvider key="state" />,
  <ModeProvider key="mode" />,
  <ChoiceProvider key="choice" />,
  <RedactedProvider key="redacted" />,
  <CapturingProvider key="capturing" />,
  <RootProvider key="root" />
];

interface SpeedtestProps {
  /** Regions to test against, in menu order; parsed from the environment on the server. */
  targets: readonly Target[]
}

/** The static layout; every live value is a small client leaf reading the provider. */
export function Speedtest({ targets }: SpeedtestProps) {
  return (
    <ComposeContextProvider contexts={contexts}>
      <SpeedtestRoot>
        <header {...stylex.props(styles.header)}>
          <div>
            <h1 {...stylex.props(styles.wordmark)}>
              speed<span {...stylex.props(styles.wordmarkDomain)}>.skk.moe</span>
            </h1>
          </div>
          <div data-screenshot="hide" {...stylex.props(styles.menu)}>
            <ScreenshotButton>
              <CameraIcon size={18} strokeWidth={1.8} aria-hidden />
              Screenshot
            </ScreenshotButton>
            <RegionMenu targets={targets} />
            <ThemeMenu />
          </div>
          <div {...stylex.props(styles.toolbar)}>
            <StartButton
              targets={targets}
              idleSlot={<><PlayIcon size={16} strokeWidth={2} fill="currentColor" aria-hidden />Start test</>}
              runningSlot={<><SquareIcon size={14} strokeWidth={2} fill="currentColor" aria-hidden />Stop</>}
              doneSlot={<><RotateCwIcon size={16} strokeWidth={2} aria-hidden />Test again</>}
            />
            <div {...stylex.props(styles.stat, styles.statCompact)}>
              <div {...stylex.props(styles.label)}>Connections</div>
              <Connections />
            </div>
            <dl>
              <Stat compact label="Latency" stat="latency" />
            </dl>
            <dl>
              <Stat compact label="Jitter" stat="jitter" />
            </dl>
          </div>
        </header>

        <div {...stylex.props(styles.directions)}>
          <DirectionSection direction="download" targets={targets}>
            <Panel direction="download" label="Download" />
            <dl {...stylex.props(styles.stats)}>
              <Stat label="Download latency" stat="downloadLatency" />
              <Stat label="Downloaded" stat="downloaded" />
            </dl>
          </DirectionSection>
          <DirectionSection direction="upload" targets={targets}>
            <Panel direction="upload" label="Upload" />
            <dl {...stylex.props(styles.stats)}>
              <Stat label="Upload latency" stat="uploadLatency" />
              <Stat label="Uploaded" stat="uploaded" />
            </dl>
          </DirectionSection>
        </div>

        <section {...stylex.props(styles.infoCard)}>
          <dl {...stylex.props(styles.info)}>
            <Info label="IP address" field="ip" hiddenSlot={hiddenJsx} />
            <Info label="Location" field="location" />
            <Info label="Provider" field="isp" hiddenSlot={hiddenJsx} />
          </dl>
          <p data-screenshot="hide" {...stylex.props(styles.footnote)}>
            <span>
              Learn more about your IP at
              {' '}
              {/* eslint-disable-next-line @eslint-react/dom-no-unsafe-target-blank -- our own site; the referrer is wanted */}
              <a href="https://ip.skk.moe" target="_blank" {...stylex.props(styles.footnoteLink)}>ip.skk.moe</a>
            </span>
            <PrivacyToggle
              showSlot={<><EyeIcon size={14} strokeWidth={1.8} aria-hidden />Show details</>}
              hideSlot={<><EyeOffIcon size={14} strokeWidth={1.8} aria-hidden />Hide details</>}
            />
          </p>
        </section>
      </SpeedtestRoot>
    </ComposeContextProvider>
  );
}

function Panel({ direction, label }: { direction: 'download' | 'upload', label: string }) {
  return (
    <div {...stylex.props(styles.panel)}>
      <h2 {...stylex.props(styles.label)}>
        <svg
          viewBox="0 0 12 12"
          aria-hidden
          {...stylex.props(styles.arrow, direction === 'download' ? styles.arrowDown : styles.arrowUp)}
        >
          <path d="M6 1.5v9M2.5 7l3.5 3.5L9.5 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label}
      </h2>
      <SpeedReadout direction={direction} />
    </div>
  );
}

interface StatProps {
  label: string,
  stat: StatKey,
  compact?: boolean
}

function Stat({ label, stat, compact }: StatProps) {
  return (
    <div {...stylex.props(styles.stat, compact && styles.statCompact, compact && styles.statFill)}>
      <dt {...stylex.props(styles.label)}>{label}</dt>
      <StatValue stat={stat} compact={compact} />
    </div>
  );
}

function Info({ label, ...value }: { label: string } & React.ComponentProps<typeof GeoValue>) {
  return (
    <div {...stylex.props(styles.infoItem)}>
      <dt {...stylex.props(styles.infoLabel)}>{label}</dt>
      <GeoValue {...value} />
    </div>
  );
}
