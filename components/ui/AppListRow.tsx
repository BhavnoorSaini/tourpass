import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { useAppTheme } from '@/providers/AppThemeProvider';

type IconName = keyof typeof Ionicons.glyphMap;

interface AppListRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: IconName;
  onPress?: () => void;
  destructive?: boolean;
  trailingChevron?: boolean;
  accessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AppListRow({
  title,
  subtitle,
  value,
  icon,
  onPress,
  destructive = false,
  trailingChevron = true,
  accessory,
  style,
}: AppListRowProps) {
  const { theme } = useAppTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'none'}
      disabled={!onPress}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <View style={styles.leading}>
        {icon ? (
          <View
            style={[
              styles.iconWrap,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceElevated,
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={16}
              color={destructive ? theme.colors.danger : theme.colors.textPrimary}
            />
          </View>
        ) : null}

        <View style={styles.textWrap}>
          <AppText
            variant="title"
            color={destructive ? theme.colors.danger : theme.colors.textPrimary}
          >
            {title}
          </AppText>
          {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
        </View>
      </View>

      <View style={styles.trailing}>
        {value ? (
          <AppText variant="caption" color={theme.colors.textSecondary}>
            {value}
          </AppText>
        ) : null}
        {accessory}
        {trailingChevron && onPress ? (
          <Ionicons name="arrow-forward" size={16} color={theme.colors.textMuted} />
        ) : null}
      </View>

      <AccentLine active={pressed} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 16,
  },
});
