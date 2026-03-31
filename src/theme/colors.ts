/**
 * AgriPrice DSS — Color Palette
 * Single source of truth for all colors in the app.
 * Change any value here to update the entire app globally.
 */

export const Colors = {
  // Primary
  primaryDark: '#2D5016',
  primary: '#4A7C28',
  primaryLight: '#6B9B3A',
  primaryMuted: '#A8C896',

  // Background
  backgroundCream: '#FAF8F0',
  backgroundLight: '#F5F3EB',
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
  chartLine: '#4A7C28',
  chartArea: 'rgba(74, 124, 40, 0.15)',
  chartAreaBorder: 'rgba(74, 124, 40, 0.3)',
  chartGrid: '#F0F0F0',

  // Tab bar
  tabActive: '#4A7C28',
  tabInactive: '#9E9E9E',
  tabBackground: '#FFFFFF',

  // Misc
  transparent: 'transparent',
  black: '#000000',
  white: '#FFFFFF',
} as const;

export type ColorKey = keyof typeof Colors;
