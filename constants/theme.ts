import { useColorScheme } from 'react-native';

// Claude-inspired minimal paper palette
export const palette = {
  cream50: '#FFFFFF',
  cream100: '#F9F8F6',
  cream200: '#F0EEEA',
  cream300: '#E5E3DC',
  gray400: '#A3A099',
  gray500: '#8A8780',
  gray600: '#66645E',
  gray700: '#403E3B',
  gray800: '#292826',
  ink900: '#1A1916',
  ink950: '#141311',

  terracotta: '#D97757', // Signature Claude Orange
} as const;

export const lightTheme = {
  background: palette.cream100,
  surface: palette.cream50, // Flat surface
  surfaceRaised: palette.cream50, // No elevation, purely flat

  text: palette.ink900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray400,

  borderRGB: '26, 25, 22',
  borderOpacity: 0.08,
  borderOpacityFocused: 0.4,

  accent: palette.terracotta,
  accentText: '#FFFFFF',

  destructive: '#9B2C2C',
  success: '#276749',

  tabBarBackground: palette.cream100,
  tabActive: palette.terracotta,
  tabInactive: palette.gray400,

  overlayBackground: 'rgba(249, 248, 246, 0.96)',
  overlayBorderRGB: '26, 25, 22',
};

export const darkTheme = {
  background: palette.ink950,
  surface: palette.ink900,
  surfaceRaised: palette.ink900,

  text: '#E8E6E1',
  textSecondary: palette.gray500,
  textTertiary: palette.gray700,

  borderRGB: '232, 230, 225',
  borderOpacity: 0.1,
  borderOpacityFocused: 0.4,

  accent: palette.terracotta,
  accentText: '#FFFFFF',

  destructive: '#C53030',
  success: '#38A169',

  tabBarBackground: palette.ink950,
  tabActive: palette.terracotta,
  tabInactive: palette.gray700,

  overlayBackground: 'rgba(20, 19, 17, 0.96)',
  overlayBorderRGB: '232, 230, 225',
};

export type Theme = {
  [K in keyof typeof lightTheme]: typeof lightTheme[K] extends string ? string : typeof lightTheme[K] extends number ? number : typeof lightTheme[K];
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}

export function border(theme: Theme, focused = false): string {
  const op = focused ? theme.borderOpacityFocused : theme.borderOpacity;
  return `rgba(${theme.borderRGB}, ${op})`;
}
