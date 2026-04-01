import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import {
  BodoniModa_700Bold,
  BodoniModa_700Bold_Italic,
} from '@expo-google-fonts/bodoni-moda';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { createTypography, type Typography } from '@/lib/Typography';
import { getTheme, type AppTheme } from '@/lib/theme';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

interface AppThemeContextValue {
  theme: AppTheme;
  typography: Typography;
}

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  const typography = useMemo(() => createTypography(theme), [theme]);
  const [fontsLoaded] = useFonts({
    BodoniModa_700Bold,
    BodoniModa_700Bold_Italic,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const navigationTheme = useMemo(
    () => ({
      dark: theme.isDark,
      colors: {
        primary: theme.colors.accent,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
        notification: theme.colors.accent,
      },
      fonts: {
        regular: {
          fontFamily: 'Manrope_400Regular',
          fontWeight: '400' as const,
        },
        medium: {
          fontFamily: 'Manrope_500Medium',
          fontWeight: '500' as const,
        },
        bold: {
          fontFamily: 'Manrope_700Bold',
          fontWeight: '700' as const,
        },
        heavy: {
          fontFamily: 'BodoniModa_700Bold',
          fontWeight: '700' as const,
        },
      },
    }),
    [theme],
  );

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    void SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => undefined);
    void SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded, theme.colors.background]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppThemeContext.Provider value={{ theme, typography }}>
      <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }

  return context;
}

export function useThemedStyles<T>(factory: (theme: AppTheme, typography: Typography) => T): T {
  const { theme, typography } = useAppTheme();
  return useMemo(() => factory(theme, typography), [factory, theme, typography]);
}
