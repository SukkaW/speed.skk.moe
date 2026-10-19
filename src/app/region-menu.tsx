'use client';

import * as stylex from '@stylexjs/stylex';
import { Menu } from '@base-ui/react/menu';
import { Check, Globe } from 'lucide-react';
import { menuStyles } from './menu-styles';
import type { Region } from './targets';

const styles = stylex.create({
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: 'auto',
    paddingInline: 10,
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    cursor: { default: 'pointer', ':disabled': 'default' },
    opacity: { default: 1, ':disabled': 0.55 }
  }
});

const LABELS: Record<Region, string> = { global: 'Global', china: 'Mainland China' };
const REGIONS: readonly Region[] = ['global', 'china'];

interface RegionMenuProps {
  value: Region,
  onValueChange: (region: Region) => void,
  disabled?: boolean
}

export function RegionMenu({ value, onValueChange, disabled }: RegionMenuProps) {
  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        disabled={disabled}
        aria-label={`Region: ${LABELS[value]}`}
        title="Region"
        {...stylex.props(menuStyles.trigger, styles.trigger)}
      >
        <Globe size={18} strokeWidth={1.8} aria-hidden />
        {LABELS[value]}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} {...stylex.props(menuStyles.positioner)}>
          <Menu.Popup {...stylex.props(menuStyles.popup)}>
            <Menu.RadioGroup value={value} onValueChange={onValueChange as (value: unknown) => void}>
              {REGIONS.map((region) => (
                <Menu.RadioItem key={region} value={region} closeOnClick {...stylex.props(menuStyles.item)}>
                  {LABELS[region]}
                  <Menu.RadioItemIndicator {...stylex.props(menuStyles.check)}>
                    <Check size={16} strokeWidth={2} aria-hidden />
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
