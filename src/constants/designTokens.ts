/**
 * Design Tokens - MyWallet
 * Extracted from Figma design
 * Type-safe design system constants for TypeScript/React
 */

export const colors = {
  primary: {
    purple: '#ad46ff',
    pink: '#f6339a',
    gradient: 'linear-gradient(143.55deg, #ad46ff 0%, #f6339a 100%)',
  },
  neutral: {
    white: '#ffffff',
    black: '#0a0a0a',
    grayDark: '#717182',
    grayLight: '#ececf0',
  },
  semantic: {
    success: '#00a63e',
    error: '#f54900',
  },
  functional: {
    border: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(255, 255, 255, 0.2)',
  },
} as const;

export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '28px',
    '3xl': '36px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
  },
  lineHeight: {
    xs: '16px',
    sm: '20px',
    lg: '27px',
    xl: '28px',
    '2xl': '30px',
    '3xl': '40px',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '36px',
} as const;

export const borderRadius = {
  sm: '8px',
  md: '10px',
  lg: '14px',
  full: '9999px',
} as const;

export const borderWidth = '0.8px';

export const iconSize = {
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '40px',
} as const;

// Component-specific compound tokens
export const components = {
  card: {
    padding: spacing.lg,
    border: `${borderWidth} solid ${colors.functional.border}`,
    borderRadius: borderRadius.lg,
  },
  button: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  header: {
    height: '68.8px',
  },
} as const;

// Type exports for TypeScript consumers
export type ColorToken = typeof colors;
export type TypographyToken = typeof typography;
export type SpacingToken = typeof spacing;
export type BorderRadiusToken = typeof borderRadius;
export type IconSizeToken = typeof iconSize;
export type ComponentToken = typeof components;
