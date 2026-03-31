/**
 * AgriPrice DSS — Color Palette
 * Single source of truth for all colors in the app.
 * Change any value here to update the entire app globally.
 */

export const Colors = {
  // Primary
  primaryDark: '#005C36',
  primary: '#007848',
  primaryLight: '#33936D',
  primaryMuted: '#B3D4C6',

  // Background
  backgroundCream: '#FFFFFF',
  backgroundLight: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFAFA',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textTertiary: '#9E9E9E',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#F5F5F5',

  // Accent
  accentGold: '#C4A94D',
  accentGoldLight: '#E8D9A0',

  // Semantic
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Recommendation badges
  sellBadge: '#22C55E',
  sellBadgeBg: '#052E16',
  holdBadge: '#F59E0B',
  holdBadgeBg: '#451A03',
  splitBadge: '#3B82F6',
  splitBadgeBg: '#172554',

  // Border & Divider
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  divider: '#EEEEEE',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Chart
  chartLine: '#007848',
  chartArea: 'rgba(0, 120, 72, 0.15)',
  chartAreaBorder: 'rgba(0, 120, 72, 0.3)',
  chartGrid: '#F0F0F0',

  // Tab bar
  tabActive: '#007848',
  tabInactive: '#9E9E9E',
  tabBackground: '#FFFFFF',

  // Misc
  transparent: 'transparent',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export type ColorKey = keyof typeof Colors;
