import type { ReactNode } from 'react';
import { View, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/providers/AppThemeProvider';

interface AppSurfaceProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AppSurface({ children, style }: AppSurfaceProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
});
