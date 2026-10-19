'use client';

import * as stylex from '@stylexjs/stylex';
import { Menu } from '@base-ui/react/menu';
import { useColorScheme, useSetColorScheme } from './color-scheme-provider';
import { menuStyles as styles } from './menu-styles';
import type { ColorScheme } from './theme';

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
