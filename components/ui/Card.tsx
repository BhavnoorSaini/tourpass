import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/constants/theme';
import { radius, spacing } from '@/constants/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  padding?: number;
}

export function Card({ children, onPress, style, innerStyle, padding = spacing.lg }: CardProps) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);

  const content = (
    <View style={[styles.inner, { padding }, innerStyle]}>
      {children}
    </View>
  );

  const opacity = pressed ? 0.92 : 1;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={[
          styles.base,
          { backgroundColor: theme.surface, opacity },
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: theme.surface },
        style,
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inner: {
    // padding applied dynamically
  },
});
