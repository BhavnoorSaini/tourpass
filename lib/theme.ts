import type { ColorSchemeName } from 'react-native';
import { StyleSheet } from 'react-native';

const spacing = {
  xxs: 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

const layout = {
  contentMaxWidth: 640,
  headerHeight: 56,
  tabBarHeight: 72,
} as const;

const borderWidths = {
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
} as const;

const sharedTheme = {
  spacing,
  radius,
  layout,
  borderWidths,
} as const;

const lightColors = {
  background: '#F7F3EB',
  backgroundRaised: '#FCFAF6',
  backgroundAlt: '#F0EADF',
  surface: '#FFFDFC',
  surfaceElevated: '#FBF7F1',
  surfaceStrong: '#F1EADC',
  surfaceMuted: '#ECE6DB',
  surfaceInverse: '#141311',
  border: 'rgba(20,19,17,0.12)',
  borderStrong: 'rgba(20,19,17,0.24)',
  textPrimary: '#15120E',
  textSecondary: '#4B4439',
  textMuted: '#7D7568',
  textInverse: '#F8F4ED',
  accent: '#B35A36',
  accentSoft: 'rgba(179,90,54,0.10)',
  accentText: '#8D4426',
  success: '#2E6B52',
  danger: '#A73D2B',
  overlay: 'rgba(21,18,14,0.22)',
  mapOverlay: 'rgba(247,243,235,0.90)',
  shadow: 'rgba(20,19,17,0.12)',
} as const;

const darkColors = {
  background: '#0F0F0D',
  backgroundRaised: '#151412',
  backgroundAlt: '#1A1814',
  surface: '#141311',
  surfaceElevated: '#191714',
  surfaceStrong: '#211D18',
  surfaceMuted: '#27231D',
  surfaceInverse: '#F5F0E7',
  border: 'rgba(245,240,231,0.12)',
  borderStrong: 'rgba(245,240,231,0.24)',
  textPrimary: '#F4EEE5',
  textSecondary: '#C6BDAF',
  textMuted: '#9C9386',
  textInverse: '#11100E',
  accent: '#D9784F',
  accentSoft: 'rgba(217,120,79,0.14)',
  accentText: '#F0B79A',
  success: '#79A88E',
  danger: '#E0846A',
  overlay: 'rgba(6,6,5,0.52)',
  mapOverlay: 'rgba(15,15,13,0.86)',
  shadow: 'rgba(0,0,0,0.28)',
} as const;

export const lightTheme = {
  mode: 'light',
  isDark: false,
  colors: lightColors,
  ...sharedTheme,
} as const;

export const darkTheme = {
  mode: 'dark',
  isDark: true,
  colors: darkColors,
  ...sharedTheme,
} as const;

export type AppTheme = typeof lightTheme | typeof darkTheme;

export function getTheme(scheme?: ColorSchemeName): AppTheme {
  return scheme === 'light' ? lightTheme : darkTheme;
}

export const appTheme = darkTheme;
