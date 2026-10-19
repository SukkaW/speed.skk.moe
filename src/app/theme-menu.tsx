import * as stylex from '@stylexjs/stylex';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { ColorSchemeMenu } from './theme-menu.client';
import type { ColorSchemeMenuItem } from './theme-menu.client';
import { colors } from './tokens.stylex';

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
  { value: 'system', text: 'System', Icon: Monitor },
  { value: 'light', text: 'Light', Icon: Sun },
  { value: 'dark', text: 'Dark', Icon: Moon }
] as const).map(({ value, text, Icon }) => ({
  value,
  label: (
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
      check={<Check size={16} strokeWidth={2} aria-hidden />}
      trigger={(
        <>
          {/*
            All three glyphs are rendered and globals.css shows the one matching the <html>
            class. Deriving it from client state would make the first client render differ
            from the server's, and that hydration re-render drops the class the blocking
            theme script applied.
          */}
          <Monitor size={18} strokeWidth={1.8} aria-hidden data-theme-icon="system" />
          <Sun size={18} strokeWidth={1.8} aria-hidden data-theme-icon="light" />
          <Moon size={18} strokeWidth={1.8} aria-hidden data-theme-icon="dark" />
        </>
      )}
    />
  );
}
