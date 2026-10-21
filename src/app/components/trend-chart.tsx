import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';
import { colors } from '../../styles/tokens.stylex';

const WIDTH = 100;
const HEIGHT = 40;
// Leaves headroom so the plateau never touches the top edge.
const PEAK_HEIGHT = HEIGHT * 0.92;
/** Every Nth sample becomes a curve point; fewer points means fewer wiggles to trace. */
const POINT_STRIDE = 2;

interface Point {
  x: number,
  y: number
}

/** Catmull-Rom spline through the points as cubic Béziers, so the line bends instead of cornering. */
function curvePath(points: readonly Point[]) {
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0, last = points.length - 1; i < last; i++) {
    const before = points[Math.max(0, i - 1)];
    const from = points[i];
    const to = points[i + 1];
    const after = points[Math.min(last, i + 2)];
    d += ` C${from.x + (to.x - before.x) / 6},${from.y + (to.y - before.y) / 6}`
      + ` ${to.x - (after.x - from.x) / 6},${to.y - (after.y - from.y) / 6}`
      + ` ${to.x},${to.y}`;
  }
  return d;
}

const styles = stylex.create({
  svg: {
    display: 'block',
    width: '100%',
    height: '100%',
    overflow: 'visible'
  },
  download: { color: colors.download },
  upload: { color: colors.upload },
  baseline: {
    stroke: colors.line,
    strokeWidth: 1,
    vectorEffect: 'non-scaling-stroke'
  },
  edge: {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinejoin: 'round',
    vectorEffect: 'non-scaling-stroke'
  }
});

interface TrendChartProps {
  samples: readonly number[],
  /** Sample slots across the full width; the chart fills left to right until they are used up. */
  capacity: number,
  tone: 'download' | 'upload'
}

/** Unit-less area chart of one phase's live readings, normalised to the running peak. */
export function TrendChart({ samples, capacity, tone }: TrendChartProps) {
  const gradientId = useId();
  const peak = Math.max(1, ...samples);
  const pointAt = (i: number): Point => ({ x: (i / (capacity - 1)) * WIDTH, y: HEIGHT - (samples[i] / peak) * PEAK_HEIGHT });
  const points: Point[] = [];
  for (let i = 0, len = samples.length; i < len; i += POINT_STRIDE) points.push(pointAt(i));
  if (samples.length > 1 && (samples.length - 1) % POINT_STRIDE !== 0) points.push(pointAt(samples.length - 1));
  const line = points.length > 1 ? curvePath(points) : null;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden
      {...stylex.props(styles.svg, styles[tone])}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.75" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <line x1="0" y1={HEIGHT} x2={WIDTH} y2={HEIGHT} {...stylex.props(styles.baseline)} />
      {line != null && (
        <>
          <path d={`${line} L${points.at(-1)?.x ?? 0},${HEIGHT} L0,${HEIGHT} Z`} fill={`url(#${gradientId})`} />
          <path d={line} {...stylex.props(styles.edge)} />
        </>
      )}
    </svg>
  );
}
