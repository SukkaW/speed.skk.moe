'use client';

import * as stylex from '@stylexjs/stylex';
import { Button } from '@base-ui/react/button';
import { Switch } from '@base-ui/react/switch';
import { useMode, useRunning, useSetMode } from '@/context/speedtest';
import { bp } from '../../styles/breakpoints.stylex';
import { colors } from '../../styles/tokens.stylex';

const styles = stylex.create({
  connections: {
    display: 'flex',
    alignItems: 'center',
    gap: { default: 8, [bp.large]: 12 },
    marginTop: { default: 6, [bp.large]: 8 },
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
    fontSize: { default: 14, [bp.large]: 16 },
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
    width: { default: 44, [bp.large]: 64 },
    height: { default: 24, [bp.large]: 32 },
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
    width: { default: 20, [bp.large]: 28 },
    height: { default: 20, [bp.large]: 28 },
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
  thumbOn: { transform: { default: 'translateX(20px)', [bp.large]: 'translateX(32px)' } },
  thumbIcon: {
    width: { default: 12, [bp.large]: 16 },
    height: { default: 12, [bp.large]: 16 }
  }
});

/** Multi/single connection switch; locked while a test runs. */
export function Connections() {
  const mode = useMode();
  const setMode = useSetMode();
  const running = useRunning();
  return (
    <div
      role="group"
      aria-label="Connections"
      {...stylex.props(styles.connections, running && styles.connectionsDisabled)}
    >
      {/* Side labels are mouse shortcuts; the switch is the accessible, keyboard-reachable control. */}
      <Button
        tabIndex={-1}
        aria-hidden
        disabled={running}
        onClick={() => setMode('multi')}
        {...stylex.props(styles.option, mode === 'multi' && styles.optionPressed)}
      >
        Multi
      </Button>
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
      <Button
        tabIndex={-1}
        aria-hidden
        disabled={running}
        onClick={() => setMode('single')}
        {...stylex.props(styles.option, mode === 'single' && styles.optionPressed)}
      >
        Single
      </Button>
    </div>
  );
}
