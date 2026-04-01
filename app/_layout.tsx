import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/providers/AuthProvider';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { RoutesProvider } from '@/contexts/RoutesContext';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <PreferencesProvider>
            <RoutesProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </RoutesProvider>
          </PreferencesProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </AppThemeProvider>
  );
}
