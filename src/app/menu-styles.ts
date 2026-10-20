import * as stylex from '@stylexjs/stylex';
import { colors } from './tokens.stylex';

/** Shared look of the header menus (appearance, region). */
export const menuStyles = stylex.create({
  trigger: {
    display: 'grid',
    placeItems: 'center',
    width: 36,
    height: 36,
    padding: 0,
    borderRadius: 12,
    borderStyle: 'none',
    boxShadow: `inset 0 0 0 1px ${colors.line}`,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.control
    },
    color: {
      default: colors.inkMuted,
      ':hover': colors.ink
    },
    cursor: { default: 'pointer', ':disabled': 'default' },
    opacity: { default: 1, ':disabled': 0.55 },
    outlineStyle: { default: 'none', ':focus-visible': 'solid' },
    outlineWidth: 2,
    outlineColor: colors.ink,
    outlineOffset: 2,
    transitionProperty: 'background-color, color',
    transitionDuration: '150ms'
  },
  /** Trigger variant with an icon and a text label. */
  labelled: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: 'auto',
    paddingInline: 10,
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: 'nowrap'
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
