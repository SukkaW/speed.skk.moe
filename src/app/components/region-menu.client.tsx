'use client';

import * as stylex from '@stylexjs/stylex';
import { Menu } from '@base-ui/react/menu';
import { menuStyles } from '../../styles/menu.stylex';
import { useRunning, useSetChoice } from '@/context/speedtest';
import { useTargetIndex } from '@/hooks/use-target';
import type { Target } from '@/lib/targets';
import { bp } from '../../styles/breakpoints.stylex';
import { colors } from '../../styles/tokens.stylex';

const styles = stylex.create({
  note: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: 400,
    color: colors.inkFaint
  },
  // Phones only get the icon; the header has no room for the label beside the other controls.
  trigger: {
    width: { default: 'auto', [bp.mobile]: 36 },
    paddingInline: { default: 10, [bp.mobile]: 0 }
  },
  label: { display: { default: 'inline', [bp.mobile]: 'none' } }
});

interface RegionMenuClientProps {
  targets: readonly Target[],
  triggerIconSlot: React.ReactNode,
  checkSlot: React.ReactNode
}

export function RegionMenuClient({ targets, triggerIconSlot, checkSlot }: RegionMenuClientProps) {
  const index = useTargetIndex(targets);
  const value = targets[index];
  const setChoice = useSetChoice();
  const running = useRunning();

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        disabled={running}
        aria-label={`Region: ${value.name}`}
        title="Region"
        {...stylex.props(menuStyles.trigger, menuStyles.labelled, styles.trigger)}
      >
        {triggerIconSlot}
        <span {...stylex.props(styles.label)}>{value.name}</span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} {...stylex.props(menuStyles.positioner)}>
          <Menu.Popup {...stylex.props(menuStyles.popup)}>
            <Menu.RadioGroup value={index} onValueChange={setChoice}>
              {targets.map((target, i) => (
                <Menu.RadioItem key={target.name} value={i} closeOnClick {...stylex.props(menuStyles.item)}>
                  <span>
                    {target.name}
                    {target.upload.length === 0 && <span {...stylex.props(styles.note)}>Upload not supported</span>}
                  </span>
                  <Menu.RadioItemIndicator {...stylex.props(menuStyles.check)}>
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
