import * as stylex from '@stylexjs/stylex';
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { ColorSchemeMenu } from './theme-menu.client';
import type { ColorSchemeMenuItem } from './theme-menu.client';
import { colors } from '../styles/tokens.stylex';

const styles = stylex.create({
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  icon: {
    color: colors.inkMuted,
    flexShrink: 0
  }
});

const ITEMS: ColorSchemeMenuItem[] = ([
  { value: 'system', text: 'System', Icon: MonitorIcon },
  { value: 'light', text: 'Light', Icon: SunIcon },
  { value: 'dark', text: 'Dark', Icon: MoonIcon }
] as const).map(({ value, text, Icon }) => ({
  value,
  labelSlot: (
    <span {...stylex.props(styles.label)}>
      <Icon size={16} strokeWidth={1.8} aria-hidden {...stylex.props(styles.icon)} />
      {text}
    </span>
  )
}));

/** Static parts (icons, labels, checkmark) render on the server; the client menu only wires state. */
export function ThemeMenu() {
  return (
    <ColorSchemeMenu
      items={ITEMS}
      checkSlot={<CheckIcon size={16} strokeWidth={2} aria-hidden />}
      triggerSlot={(
        <>
          {/*
            All three glyphs are rendered and globals.css shows the one matching the <html>
            class. Deriving it from client state would make the first client render differ
            from the server's, and that hydration re-render drops the class the blocking
            theme script applied.
          */}
          <MonitorIcon size={18} strokeWidth={1.8} aria-hidden data-theme-icon="system" />
          <SunIcon size={18} strokeWidth={1.8} aria-hidden data-theme-icon="light" />
          <MoonIcon size={18} strokeWidth={1.8} aria-hidden data-theme-icon="dark" />
        </>
      )}
    />
  );
}
