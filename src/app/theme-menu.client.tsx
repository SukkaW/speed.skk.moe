'use client';

import * as stylex from '@stylexjs/stylex';
import { Menu } from '@base-ui/react/menu';
import { useColorScheme, useSetColorScheme } from './color-scheme-provider';
import type { ColorScheme } from './theme';
import { colors } from './tokens.stylex';

const styles = stylex.create({
  trigger: {
    display: 'grid',
    placeItems: 'center',
    width: 36,
    height: 36,
    padding: 0,
    borderRadius: 12,
    borderStyle: 'none',
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.control
    },
    color: {
      default: colors.inkMuted,
      ':hover': colors.ink
    },
    cursor: 'pointer',
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: colors.ink,
    outlineOffset: 2,
    transitionProperty: 'background-color, color',
    transitionDuration: '150ms'
  },
  positioner: {
    zIndex: 10,
    outlineStyle: 'none'
  },
  popup: {
    minWidth: 160,
    padding: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.raised,
    boxShadow: '0 12px 32px -8px light-dark(rgba(26, 36, 34, 0.18), rgba(0, 0, 0, 0.6))',
    outlineStyle: 'none'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    height: 36,
    paddingInline: 12,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    color: {
      default: colors.inkMuted,
      ':hover': colors.ink,
      ':focus-visible': colors.ink
    },
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.control,
      ':focus-visible': colors.control
    },
    outlineStyle: 'none',
    userSelect: 'none',
    cursor: 'pointer'
  },
  check: {
    display: 'flex',
    color: colors.ink
  }
});

export interface ColorSchemeMenuItem {
  value: ColorScheme,
  /** Server-rendered icon + text */
  label: React.ReactNode
}

interface ColorSchemeMenuProps {
  items: readonly ColorSchemeMenuItem[],
  trigger: React.ReactNode,
  check: React.ReactNode
}

export function ColorSchemeMenu({ items, trigger, check }: ColorSchemeMenuProps) {
  const scheme = useColorScheme();
  const setScheme = useSetColorScheme();

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger aria-label="Appearance" title="Appearance" {...stylex.props(styles.trigger)}>
        {trigger}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} {...stylex.props(styles.positioner)}>
          <Menu.Popup {...stylex.props(styles.popup)}>
            <Menu.RadioGroup value={scheme} onValueChange={setScheme as (value: unknown) => void}>
              {items.map(({ value, label }) => (
                <Menu.RadioItem key={value} value={value} closeOnClick {...stylex.props(styles.item)}>
                  {label}
                  <Menu.RadioItemIndicator {...stylex.props(styles.check)}>
                    {check}
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
