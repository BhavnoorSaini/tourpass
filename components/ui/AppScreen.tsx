import type { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useAppTheme } from '@/providers/AppThemeProvider';

interface AppScreenProps {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
}

export function AppScreen({
  children,
  scroll = true,
  edges = ['top', 'left', 'right'],
  contentContainerStyle,
  style,
  keyboardShouldPersistTaps = 'handled',
}: AppScreenProps) {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: theme.spacing.sm,
              paddingBottom: theme.spacing.xl,
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.content,
            {
              paddingHorizontal: theme.spacing.sm,
              paddingBottom: theme.spacing.xl,
            },
            contentContainerStyle,
          ]}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
