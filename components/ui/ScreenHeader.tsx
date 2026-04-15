import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string; 
  onBack?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenHeader({
  title,
  onBack,
  right,
  style,
}: ScreenHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
        style,
      ]}
    >
      <View style={styles.sideSlot}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={[styles.backButton, { backgroundColor: theme.surface }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>

      <View style={styles.titleWrap}>
        <Text style={[typography.headingM, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={[styles.sideSlot, styles.rightSlot]}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  sideSlot: {
    width: 96,
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 36,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
});
