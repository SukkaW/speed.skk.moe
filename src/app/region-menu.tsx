'use client';

import * as stylex from '@stylexjs/stylex';
import { Menu } from '@base-ui/react/menu';
import { Check, Server } from 'lucide-react';
import { menuStyles } from './menu-styles';
import type { Target } from './targets';
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

interface RegionMenuProps {
  targets: readonly Target[],
  value: Target,
  onValueChange: (target: Target) => void,
  disabled?: boolean
}

export function RegionMenu({ targets, value, onValueChange, disabled }: RegionMenuProps) {
  const pick = (name: unknown) => {
    const next = targets.find((target) => target.name === name);
    if (next) onValueChange(next);
  };

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        disabled={disabled}
        aria-label={`Region: ${value.name}`}
        title="Region"
        {...stylex.props(menuStyles.trigger, menuStyles.labelled, styles.trigger)}
      >
        <Server size={18} strokeWidth={1.8} aria-hidden />
        <span {...stylex.props(styles.label)}>{value.name}</span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} {...stylex.props(menuStyles.positioner)}>
          <Menu.Popup {...stylex.props(menuStyles.popup)}>
            <Menu.RadioGroup value={value.name} onValueChange={pick}>
              {targets.map((target) => (
                <Menu.RadioItem key={target.name} value={target.name} closeOnClick {...stylex.props(menuStyles.item)}>
                  <span>
                    {target.name}
                    {target.upload.length === 0 && <span {...stylex.props(styles.note)}>(upload not supported)</span>}
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
