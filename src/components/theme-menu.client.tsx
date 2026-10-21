'use client';

import * as stylex from '@stylexjs/stylex';
import { Menu } from '@base-ui/react/menu';
import { useColorScheme, useSetColorScheme } from '@/context/color-scheme-provider';
import { menuStyles as styles } from '../styles/menu.stylex';
import type { ColorScheme } from '@/lib/theme';

export interface ColorSchemeMenuItem {
  value: ColorScheme,
  /** Server-rendered icon + text */
  labelSlot: React.ReactNode
}

interface ColorSchemeMenuProps {
  items: readonly ColorSchemeMenuItem[],
  triggerSlot: React.ReactNode,
  checkSlot: React.ReactNode
}

export function ColorSchemeMenu({ items, triggerSlot, checkSlot }: ColorSchemeMenuProps) {
  const scheme = useColorScheme();
  const setScheme = useSetColorScheme();

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger aria-label="Appearance" title="Appearance" {...stylex.props(styles.trigger)}>
        {triggerSlot}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} {...stylex.props(styles.positioner)}>
          <Menu.Popup {...stylex.props(styles.popup)}>
            <Menu.RadioGroup value={scheme} onValueChange={setScheme as (value: unknown) => void}>
              {items.map(({ value, labelSlot }) => (
                <Menu.RadioItem key={value} value={value} closeOnClick {...stylex.props(styles.item)}>
                  {labelSlot}
                  <Menu.RadioItemIndicator {...stylex.props(styles.check)}>
                    {checkSlot}
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
