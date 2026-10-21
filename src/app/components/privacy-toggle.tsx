'use client';

import * as stylex from '@stylexjs/stylex';
import { Toggle } from '@base-ui/react/toggle';
import { useRedacted, useSetRedacted } from '@/context/speedtest';
import { colors } from '../../styles/tokens.stylex';

const styles = stylex.create({
  privacyToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    paddingInline: 10,
    borderRadius: 8,
    borderStyle: 'none',
    boxShadow: `inset 0 0 0 1px ${colors.line}`,
    backgroundColor: { default: 'transparent', ':hover': colors.control },
    color: { default: colors.inkMuted, ':hover': colors.ink },
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 500,
    cursor: 'pointer',
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: colors.ink,
    outlineOffset: 2,
    transitionProperty: 'background-color, color',
    transitionDuration: '150ms'
  }
});

interface PrivacyToggleProps {
  /** Label while details are hidden. */
  showSlot: React.ReactNode,
  /** Label while details are visible. */
  hideSlot: React.ReactNode
}

export function PrivacyToggle({ showSlot, hideSlot }: PrivacyToggleProps) {
  const redacted = useRedacted();
  return (
    <Toggle pressed={redacted} onPressedChange={useSetRedacted()} {...stylex.props(styles.privacyToggle)}>
      {redacted ? showSlot : hideSlot}
    </Toggle>
  );
}
