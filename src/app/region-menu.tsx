'use client';

import * as stylex from '@stylexjs/stylex';
import { Menu } from '@base-ui/react/menu';
import { Check, Globe } from 'lucide-react';
import { menuStyles } from './menu-styles';
import type { Region } from './targets';
import { colors } from './tokens.stylex';

const MOBILE = '@media (max-width: 639px)';

const styles = stylex.create({
  note: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: 400,
    color: colors.inkFaint
  },
  // Phones only get the globe; the header has no room for the label beside the other controls.
  trigger: {
    width: { default: 'auto', [MOBILE]: 36 },
    paddingInline: { default: 10, [MOBILE]: 0 }
  },
  label: { display: { default: 'inline', [MOBILE]: 'none' } }
});

const LABELS: Record<Region, string> = { global: 'Global', china: 'Mainland China' };
/** Shown after the label in the menu only; the trigger stays short. */
const NOTES: Partial<Record<Region, string>> = { china: '(upload not supported)' };
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
        {...stylex.props(menuStyles.trigger, menuStyles.labelled, styles.trigger)}
      >
        <Globe size={18} strokeWidth={1.8} aria-hidden />
        <span {...stylex.props(styles.label)}>{LABELS[value]}</span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} {...stylex.props(menuStyles.positioner)}>
          <Menu.Popup {...stylex.props(menuStyles.popup)}>
            <Menu.RadioGroup value={value} onValueChange={onValueChange as (value: unknown) => void}>
              {REGIONS.map((region) => (
                <Menu.RadioItem key={region} value={region} closeOnClick {...stylex.props(menuStyles.item)}>
                  <span>
                    {LABELS[region]}
                    {NOTES[region] === undefined ? null : <span {...stylex.props(styles.note)}>{NOTES[region]}</span>}
                  </span>
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
