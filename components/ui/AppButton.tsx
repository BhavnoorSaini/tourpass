import { useState } from 'react';
import {
  ActivityIndicator,
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
type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
}: AppButtonProps) {
  const { theme } = useAppTheme();
  const [pressed, setPressed] = useState(false);

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.surfaceInverse,
      borderColor: theme.colors.surfaceInverse,
      textColor: theme.colors.textInverse,
      iconColor: theme.colors.textInverse,
      lineColor: theme.colors.accent,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.borderStrong,
      textColor: theme.colors.textPrimary,
      iconColor: theme.colors.textPrimary,
      lineColor: theme.colors.accent,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: theme.colors.textPrimary,
      iconColor: theme.colors.textPrimary,
      lineColor: theme.colors.accent,
    },
    danger: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      textColor: theme.colors.danger,
      iconColor: theme.colors.danger,
      lineColor: theme.colors.danger,
    },
  } as const;

  const currentVariant = variantStyles[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.button,
        {
          backgroundColor: currentVariant.backgroundColor,
          borderColor: currentVariant.borderColor,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ? (
          <Ionicons
            name={icon}
            size={16}
            color={currentVariant.iconColor}
            style={styles.icon}
          />
        ) : null}

        {loading ? (
          <ActivityIndicator color={currentVariant.textColor} />
        ) : (
          <AppText variant="button" color={currentVariant.textColor}>
            {label}
          </AppText>
        )}
      </View>

      <AccentLine
        active={variant === 'primary' || pressed}
        color={currentVariant.lineColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
});
