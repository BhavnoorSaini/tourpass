import type { TextStyle } from 'react-native';
import type { AppTheme } from '@/lib/theme';

export const fontFamilies = {
  display: 'BodoniModa_700Bold',
  displayItalic: 'BodoniModa_700Bold_Italic',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemiBold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyExtraBold: 'Manrope_800ExtraBold',
} as const;

export function createTypography(theme: AppTheme) {
  return {
    brand: {
      fontFamily: fontFamilies.display,
      fontSize: 22,
      lineHeight: 24,
      letterSpacing: -0.6,
      color: theme.colors.textPrimary,
    } satisfies TextStyle,
    display: {
      fontFamily: fontFamilies.display,
      fontSize: 48,
      lineHeight: 52,
      letterSpacing: -1.4,
      color: theme.colors.textPrimary,
    } satisfies TextStyle,
    hero: {
      fontFamily: fontFamilies.display,
      fontSize: 38,
      lineHeight: 42,
      letterSpacing: -1.1,
      color: theme.colors.textPrimary,
    } satisfies TextStyle,
    screenTitle: {
      fontFamily: fontFamilies.display,
      fontSize: 30,
      lineHeight: 34,
      letterSpacing: -0.8,
      color: theme.colors.textPrimary,
    } satisfies TextStyle,
    sectionTitle: {
      fontFamily: fontFamilies.bodySemiBold,
      fontSize: 18,
      lineHeight: 22,
      letterSpacing: -0.3,
      color: theme.colors.textPrimary,
    } satisfies TextStyle,
    title: {
      fontFamily: fontFamilies.bodyBold,
      fontSize: 16,
      lineHeight: 20,
      color: theme.colors.textPrimary,
    } satisfies TextStyle,
    body: {
      fontFamily: fontFamilies.body,
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textSecondary,
    } satisfies TextStyle,
    bodyStrong: {
      fontFamily: fontFamilies.bodyMedium,
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textPrimary,
    } satisfies TextStyle,
    caption: {
      fontFamily: fontFamilies.body,
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.textMuted,
    } satisfies TextStyle,
    label: {
      fontFamily: fontFamilies.bodySemiBold,
      fontSize: 12,
      lineHeight: 14,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: theme.colors.textMuted,
    } satisfies TextStyle,
    eyebrow: {
      fontFamily: fontFamilies.bodyBold,
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: theme.colors.accentText,
    } satisfies TextStyle,
    button: {
      fontFamily: fontFamilies.bodySemiBold,
      fontSize: 14,
      lineHeight: 18,
      letterSpacing: 0.2,
      color: theme.colors.textPrimary,
    } satisfies TextStyle,
    mono: {
      fontFamily: fontFamilies.bodyMedium,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.3,
      color: theme.colors.textSecondary,
    } satisfies TextStyle,
  } as const;
}

export type Typography = ReturnType<typeof createTypography>;
