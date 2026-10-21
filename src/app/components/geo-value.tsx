'use client';

import * as stylex from '@stylexjs/stylex';
import { Fragment } from 'react';
import { stringJoin } from 'foxts/string-join';
import { useRedacted } from '@/context/speedtest';
import { bp } from '../../styles/breakpoints.stylex';
import { colors } from '../../styles/tokens.stylex';
import { useGeo } from '@/hooks/use-geo';
import type { Geo } from '@/hooks/use-geo';

const pulse = stylex.keyframes({
  '50%': { opacity: 0.45 }
});

const styles = stylex.create({
  infoValue: {
    display: 'block',
    marginTop: 2,
    fontSize: { default: 14, [bp.large]: 16 },
    fontWeight: 500,
    lineHeight: 1.3,
    color: colors.ink,
    fontVariantNumeric: 'tabular-nums',
    overflowWrap: 'anywhere'
  },
  empty: { color: colors.inkFaint },
  // Height is the value's font-size and the row its line-height, so nothing shifts when the lookup lands.
  skeletonRow: {
    display: 'flex',
    alignItems: 'center',
    height: '1.3em'
  },
  skeleton: {
    height: '1em',
    maxWidth: '100%',
    borderRadius: 4,
    backgroundColor: colors.control,
    animationName: pulse,
    animationDuration: { default: '1.4s', '@media (prefers-reduced-motion: reduce)': '0s' },
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out'
  },
  // Roughly the width of a typical value.
  skeletonIp: { width: '18ch' },
  skeletonLocation: { width: '20ch' },
  skeletonIsp: { width: '26ch' }
});

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

type GeoField = 'ip' | 'location' | 'isp';

const SKELETON = {
  ip: styles.skeletonIp,
  location: styles.skeletonLocation,
  isp: styles.skeletonIsp
} satisfies Record<GeoField, unknown>;

function read(field: GeoField, geo: Geo | undefined, redacted: boolean, hiddenSlot: React.ReactNode): React.ReactNode {
  if (field === 'location') return geo && stringJoin(redacted ? [geo.country] : [geo.city, geo.region, geo.country], ', ', true);
  if (redacted) return hiddenSlot;
  return field === 'ip' ? geo && <Address ip={geo.ip} /> : geo?.isp;
}

interface GeoValueProps {
  field: GeoField,
  /** Shown in place of the value while details are hidden; the location keeps its country instead. */
  hiddenSlot?: React.ReactNode
}

export function GeoValue({ field, hiddenSlot }: GeoValueProps) {
  const { data: geo, isLoading } = useGeo();
  const value = read(field, geo, useRedacted(), hiddenSlot);
  return (
    <dd {...stylex.props(styles.infoValue, !isLoading && !value && styles.empty)}>
      {isLoading
        ? <span {...stylex.props(styles.skeletonRow)}><span {...stylex.props(styles.skeleton, SKELETON[field])} /></span>
        : value || '—'}
    </dd>
  );
}
