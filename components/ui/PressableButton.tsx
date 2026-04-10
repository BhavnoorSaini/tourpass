import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { border, useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';

import { Ionicons } from '@expo/vector-icons';

interface PressableButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function PressableButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  icon,
}: PressableButtonProps) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDestructive = variant === 'destructive';

  const backgroundColor = isPrimary
    ? theme.accent
    : isSecondary
    ? theme.surface
    : 'transparent';

  const borderColor = isSecondary ? border(theme) : 'transparent';

  const labelColor = isPrimary
    ? theme.accentText
    : isSecondary
    ? theme.text
    : isDestructive
    ? theme.destructive
    : theme.text;

  const opacity = disabled ? 0.38 : pressed ? 0.85 : 1;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: isSecondary ? 1 : 0,
          opacity,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={labelColor} />
      ) : (
        <View style={styles.content}>
          <Text style={[typography.buttonL, { color: labelColor }]}>{label}</Text>
          {icon && <Ionicons name={icon} size={18} color={labelColor} style={styles.icon} />}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginLeft: 8,
  },
});
