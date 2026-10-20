'use client';

import * as stylex from '@stylexjs/stylex';
import { Fragment, useState } from 'react';
import { Button } from '@base-ui/react/button';
import { Switch } from '@base-ui/react/switch';
import { Play, RotateCw, Square } from 'lucide-react';
import { stringJoin } from 'foxts/string-join';
import { prettyBandwidth, prettyTraffic } from 'xbits';
import { RegionMenu } from './region-menu';
import { TrendChart } from './trend-chart';
import { colors, fonts } from './tokens.stylex';
import { useGeo } from './use-geo';
import { TREND_SAMPLES, useSpeedtest } from './use-speedtest';
import type { Region, ThreadMode } from './use-speedtest';

const wholeNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function formatOrDash(value: number | null, format: Intl.NumberFormat) {
  return value == null ? null : format.format(value);
}

/** xbits returns "140 MiB"; the value and unit are typeset separately. */
function splitUnit(pretty: string) {
  const [value, unit] = pretty.split(' ', 2);
  return { value, unit };
}

const MOBILE = '@media (max-width: 639px)';
const LARGE = '@media (min-width: 1024px)';

const styles = stylex.create({
  grid: {
    display: 'grid',
    gap: { default: 12, [MOBILE]: 10, [LARGE]: 16 },
    width: '100%',
    maxWidth: 1120
  },
  // Slim bar (wordmark, menu) on top; the toolbar wraps to its own full-width row beneath.
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: { default: 16, [MOBILE]: 12, [LARGE]: 20 },
    marginBottom: { default: 4, [LARGE]: 8 }
  },
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
      [MOBILE]: 'repeat(2, minmax(0, 1fr))'
    },
    gap: { default: 12, [MOBILE]: 10, [LARGE]: 16 },
    flexBasis: '100%'
  },
  connections: {
    display: 'flex',
    alignItems: 'center',
    gap: { default: 8, [LARGE]: 12 },
    marginTop: { default: 6, [LARGE]: 8 },
    transitionProperty: 'opacity',
    transitionDuration: '150ms'
  },
  connectionsDisabled: { opacity: 0.55 },
  option: {
    paddingBlock: 4,
    paddingInline: 2,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: {
      default: colors.inkMuted,
      ':hover': colors.ink
    },
    fontFamily: 'inherit',
    fontSize: { default: 14, [LARGE]: 16 },
    fontWeight: 500,
    cursor: {
      default: 'pointer',
      ':disabled': 'default'
    },
    transitionProperty: 'color',
    transitionDuration: '150ms'
  },
  optionPressed: { color: colors.ink },
  switch: {
    position: 'relative',
    flexShrink: 0,
    width: { default: 44, [LARGE]: 64 },
    height: { default: 24, [LARGE]: 32 },
    padding: 0,
    borderStyle: 'none',
    borderRadius: 999,
    backgroundColor: colors.control,
    boxShadow: `inset 0 0 0 1px ${colors.line}`,
    cursor: {
      default: 'pointer',
      ':disabled': 'default'
    },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: colors.ink,
    outlineOffset: 2
  },
  thumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    display: 'grid',
    placeItems: 'center',
    width: { default: 20, [LARGE]: 28 },
    height: { default: 20, [LARGE]: 28 },
    borderRadius: 999,
    backgroundColor: colors.ink,
    color: colors.surface,
    transform: 'translateX(0)',
    transitionProperty: 'transform',
    transitionDuration: {
      default: '150ms',
      '@media (prefers-reduced-motion: reduce)': '0ms'
    }
  },
  thumbOn: { transform: { default: 'translateX(20px)', [LARGE]: 'translateX(32px)' } },
  thumbIcon: {
    width: { default: 12, [LARGE]: 16 },
    height: { default: 12, [LARGE]: 16 }
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexShrink: 0,
    minWidth: { default: 140, [MOBILE]: 0 },
    minHeight: 44,
    paddingInline: { default: 24, [MOBILE]: 18, [LARGE]: 32 },
    borderRadius: 12,
    borderStyle: 'none',
    backgroundColor: {
      default: colors.ink,
      ':hover': `color-mix(in srgb, ${colors.ink} 86%, ${colors.surface})`
    },
    color: colors.surface,
    fontFamily: 'inherit',
    fontSize: { default: 15, [LARGE]: 17 },
    fontWeight: 500,
    cursor: { default: 'pointer', ':disabled': 'default' },
    opacity: { default: 1, ':disabled': 0.55 },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: colors.ink,
    outlineOffset: 3,
    transitionProperty: 'background-color, color, box-shadow',
    transitionDuration: '150ms'
  },
  buttonQuiet: {
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.control
    },
    color: colors.ink,
    boxShadow: `inset 0 0 0 1px ${colors.line}`
  },
  directions: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(2, minmax(0, 1fr))',
      [MOBILE]: 'minmax(0, 1fr)'
    },
    gap: { default: 12, [MOBILE]: 10, [LARGE]: 16 }
  },
  direction: {
    display: 'grid',
    gap: { default: 12, [MOBILE]: 10, [LARGE]: 16 },
    transitionProperty: 'opacity',
    transitionDuration: '150ms'
  },
  // The direction has no endpoint in the chosen region; the cards stay so the layout does not shift.
  directionMuted: { opacity: 0.45 },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: { default: 10, [MOBILE]: 6, [LARGE]: 14 },
    paddingTop: { default: 20, [MOBILE]: 16, [LARGE]: 28 },
    paddingInline: { default: 20, [MOBILE]: 16, [LARGE]: 28 },
    borderRadius: { default: 16, [LARGE]: 20 },
    backgroundColor: colors.raised,
    overflow: 'hidden'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: { default: 14, [LARGE]: 15 },
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
  panelValue: {
    fontFamily: fonts.condensed,
    fontSize: {
      default: 'clamp(44px, 12vw, 64px)',
      [MOBILE]: 'clamp(40px, 11vw, 48px)',
      [LARGE]: 'clamp(60px, 6vw, 88px)'
    },
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums',
    color: colors.ink
  },
  panelUnit: {
    marginLeft: 8,
    fontFamily: fonts.sans,
    fontSize: { default: 16, [LARGE]: 20 },
    fontWeight: 400,
    letterSpacing: 0,
    color: colors.inkMuted
  },
  panelChart: {
    height: { default: 112, [MOBILE]: 80, [LARGE]: 'clamp(140px, 13vw, 200px)' },
    marginTop: { default: 6, [MOBILE]: 4 },
    marginInline: { default: -20, [MOBILE]: -16, [LARGE]: -28 }
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: { default: 12, [MOBILE]: 10, [LARGE]: 16 }
  },
  stat: {
    padding: { default: 16, [MOBILE]: 12, [LARGE]: 24 },
    borderRadius: { default: 16, [LARGE]: 20 },
    backgroundColor: colors.raised
  },
  statCompact: {
    paddingBlock: { default: 10, [LARGE]: 14 },
    paddingInline: { default: 14, [MOBILE]: 12, [LARGE]: 16 },
    borderRadius: 16
  },
  statFill: { height: '100%' },
  statValueCompact: {
    marginTop: 4,
    fontSize: { default: 26, [MOBILE]: 24, [LARGE]: 28 }
  },
  statValue: {
    display: 'block',
    marginTop: { default: 6, [MOBILE]: 4, [LARGE]: 10 },
    fontFamily: fonts.condensed,
    fontSize: { default: 32, [MOBILE]: 28, [LARGE]: 44 },
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums',
    color: colors.ink
  },
  statUnit: {
    marginLeft: 6,
    fontFamily: fonts.sans,
    fontSize: { default: 14, [LARGE]: 16 },
    fontWeight: 400,
    letterSpacing: 0,
    color: colors.inkMuted
  },
  empty: { color: colors.inkFaint },
  // Each item starts from the width its text needs and the leftover is shared out, so the row is
  // always filled; when IP and location leave no room, the whole provider item wraps to a second
  // line rather than any value being squeezed.
  info: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: { default: 'row', [MOBILE]: 'column' },
    columnGap: { default: 32, [LARGE]: 48 },
    rowGap: { default: 12, [MOBILE]: 8, [LARGE]: 16 },
    paddingInline: { default: 16, [MOBILE]: 12, [LARGE]: 24 },
    paddingTop: { default: 8, [MOBILE]: 4, [LARGE]: 12 }
  },
  infoItem: {
    flexGrow: 1,
    flexBasis: 'auto',
    maxWidth: '100%'
  },
  infoLabel: {
    fontSize: { default: 13, [LARGE]: 14 },
    lineHeight: 1.3,
    color: colors.inkMuted
  },
  infoValue: {
    display: 'block',
    marginTop: 2,
    fontSize: { default: 14, [LARGE]: 16 },
    fontWeight: 500,
    lineHeight: 1.3,
    color: colors.ink,
    fontVariantNumeric: 'tabular-nums',
    overflowWrap: 'anywhere'
  },
  footnote: {
    paddingInline: { default: 16, [MOBILE]: 12, [LARGE]: 24 },
    fontSize: { default: 13, [LARGE]: 14 },
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
  }
});

interface SpeedtestProps {
  /** Server-rendered wordmark and appearance menu, placed in the header row. */
  wordmark: React.ReactNode,
  appearance: React.ReactNode
}

export function Speedtest({ wordmark, appearance }: SpeedtestProps) {
  const [mode, setMode] = useState<ThreadMode>('multi');
  const [regionChoice, setRegionChoice] = useState<Region | null>(null);
  const { data: geo, isLoading: locating } = useGeo();
  // A manual pick always wins; otherwise the lookup decides, Global until it has answered.
  const region = regionChoice ?? (geo?.country_code === 'CN' ? 'china' : 'global');
  const { phase, live, loaded, results, trend, traffic, start, stop } = useSpeedtest(mode, region);
  const running = phase !== 'idle' && phase !== 'done';
  const downloaded = splitUnit(prettyTraffic(traffic.download));
  const uploaded = splitUnit(prettyTraffic(traffic.upload));

  return (
    <div {...stylex.props(styles.grid)}>
      <header {...stylex.props(styles.header)}>
        <div>{wordmark}</div>
        <div {...stylex.props(styles.menu)}>
          <RegionMenu value={region} onValueChange={setRegionChoice} disabled={running} />
          {appearance}
        </div>
        <div {...stylex.props(styles.toolbar)}>
          <Button
            disabled={locating}
            onClick={running ? stop : start}
            {...stylex.props(styles.button, running && styles.buttonQuiet)}
          >
            {phase === 'idle' && <><Play size={16} strokeWidth={2} fill="currentColor" aria-hidden />Start test</>}
            {running && <><Square size={14} strokeWidth={2} fill="currentColor" aria-hidden />Stop</>}
            {phase === 'done' && <><RotateCw size={16} strokeWidth={2} aria-hidden />Test again</>}
          </Button>
          <div {...stylex.props(styles.stat, styles.statCompact)}>
            <div {...stylex.props(styles.label)}>Connections</div>
            <div
              role="group"
              aria-label="Connections"
              {...stylex.props(styles.connections, running && styles.connectionsDisabled)}
            >
              {/* Side labels are mouse shortcuts; the switch is the accessible, keyboard-reachable control. */}
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                disabled={running}
                onClick={() => setMode('multi')}
                {...stylex.props(styles.option, mode === 'multi' && styles.optionPressed)}
              >
                Multi
              </button>
              <Switch.Root
                aria-label="Use a single connection"
                checked={mode === 'single'}
                disabled={running}
                onCheckedChange={(checked) => setMode(checked ? 'single' : 'multi')}
                {...stylex.props(styles.switch)}
              >
                <Switch.Thumb {...stylex.props(styles.thumb, mode === 'single' && styles.thumbOn)}>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    {...stylex.props(styles.thumbIcon)}
                  >
                    {mode === 'multi' && <path d="M3 4h8m-2.5-2.5L11 4l-2.5 2.5M3 12h8m-2.5-2.5L11 12l-2.5 2.5" />}
                    <path d="M3 8h8M8.5 5.5 11 8l-2.5 2.5" />
                  </svg>
                </Switch.Thumb>
              </Switch.Root>
              <button
                type="button"
                tabIndex={-1}
                aria-hidden
                disabled={running}
                onClick={() => setMode('single')}
                {...stylex.props(styles.option, mode === 'single' && styles.optionPressed)}
              >
                Single
              </button>
            </div>
          </div>
          <dl>
            <Stat compact label="Latency" value={formatOrDash(phase === 'latency' ? live : results.latency, wholeNumber)} unit="ms" />
          </dl>
          <dl>
            <Stat compact label="Jitter" value={formatOrDash(results.jitter, oneDecimal)} unit="ms" />
          </dl>
        </div>
      </header>

      <div {...stylex.props(styles.directions)}>
        <section {...stylex.props(styles.direction)}>
          <Panel
            direction="download"
            label="Download"
            value={phase === 'download' ? live : results.download}
            samples={trend.download}
          />
          <dl {...stylex.props(styles.stats)}>
            <Stat label="Download latency" value={formatOrDash(phase === 'download' ? loaded : results.downloadLatency, wholeNumber)} unit="ms" />
            <Stat label="Downloaded" value={downloaded.value} unit={downloaded.unit} />
          </dl>
        </section>
        <section {...stylex.props(styles.direction, region === 'china' && styles.directionMuted)}>
          <Panel
            direction="upload"
            label="Upload"
            value={phase === 'upload' ? live : results.upload}
            samples={trend.upload}
          />
          <dl {...stylex.props(styles.stats)}>
            <Stat label="Upload latency" value={formatOrDash(phase === 'upload' ? loaded : results.uploadLatency, wholeNumber)} unit="ms" />
            <Stat label="Uploaded" value={uploaded.value} unit={uploaded.unit} />
          </dl>
        </section>
      </div>

      <dl {...stylex.props(styles.info)}>
        <Info label="IP address" value={geo && <Address ip={geo.ip} />} />
        <Info label="Location" value={geo && stringJoin([geo.city, geo.region, geo.country], ', ', true)} />
        <Info label="Provider" value={geo?.isp} />
      </dl>
      <p {...stylex.props(styles.footnote)}>
        Learn more about your IP at
        {' '}
        {/* eslint-disable-next-line @eslint-react/dom-no-unsafe-target-blank -- our own site; the referrer is wanted */}
        <a href="https://ip.skk.moe" target="_blank" {...stylex.props(styles.footnoteLink)}>ip.skk.moe</a>
      </p>
    </div>
  );
}

interface PanelProps {
  direction: 'download' | 'upload',
  label: string,
  value: number | null,
  samples: readonly number[]
}

function Panel({ direction, label, value, samples }: PanelProps) {
  const speed = value == null ? null : splitUnit(prettyBandwidth(value * 1e6, { locale: 'en-US', minimumFractionDigits: 2, maximumFractionDigits: 2 }));
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
      <p {...stylex.props(styles.panelValue, speed === null && styles.empty)}>
        {speed?.value ?? '—'}
        <span {...stylex.props(styles.panelUnit)}>{speed?.unit ?? 'Mbps'}</span>
      </p>
      <div {...stylex.props(styles.panelChart)}>
        <TrendChart samples={samples} capacity={Math.max(samples.length, TREND_SAMPLES)} tone={direction} />
      </div>
    </div>
  );
}

interface StatProps {
  label: string,
  value: string | null,
  unit: string,
  compact?: boolean
}

function Stat({ label, value, unit, compact }: StatProps) {
  return (
    <div {...stylex.props(styles.stat, compact && styles.statCompact, compact && styles.statFill)}>
      <dt {...stylex.props(styles.label)}>{label}</dt>
      <dd {...stylex.props(styles.statValue, compact && styles.statValueCompact, value == null && styles.empty)}>
        {value ?? '—'}
        <span {...stylex.props(styles.statUnit)}>{unit}</span>
      </dd>
    </div>
  );
}

/** An IPv6 address may wrap, but only between groups; copying still yields the plain address. */
function Address({ ip }: { ip: string }) {
  const groups = ip.split(':');
  return groups.map((group, i) => (
    // eslint-disable-next-line @eslint-react/no-array-index-key -- groups are positional and the address is static
    <Fragment key={i}>
      {i > 0 && <>:<wbr /></>}
      {group}
    </Fragment>
  ));
}

function Info({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div {...stylex.props(styles.infoItem)}>
      <dt {...stylex.props(styles.infoLabel)}>{label}</dt>
      <dd {...stylex.props(styles.infoValue, !value && styles.empty)}>{value || '—'}</dd>
    </div>
  );
}
