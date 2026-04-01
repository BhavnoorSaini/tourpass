import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/providers/AppThemeProvider';

interface AppHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backVisible?: boolean;
  rightAction?: ReactNode;
}

export function AppHeader({
  eyebrow,
  title,
  subtitle,
  backVisible = false,
  rightAction,
}: AppHeaderProps) {
  const router = useRouter();
  const { theme } = useAppTheme();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {backVisible ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.textPrimary} />
          </Pressable>
        ) : (
          <View />
        )}

        {rightAction}
      </View>

      {eyebrow ? <AppText variant="eyebrow">{eyebrow}</AppText> : null}
      <AppText variant="screenTitle" style={styles.title}>
        {title}
      </AppText>
      {subtitle ? <AppText variant="body">{subtitle}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  topRow: {
    minHeight: 44,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 8,
    marginBottom: 8,
  },
});
