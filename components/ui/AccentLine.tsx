import { useEffect, useRef } from 'react';
import {
  Animated,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/providers/AppThemeProvider';

interface AccentLineProps {
  active: boolean;
  color?: string;
  inset?: number;
  style?: StyleProp<ViewStyle>;
}

export function AccentLine({
  active,
  color,
  inset = 0,
  style,
}: AccentLineProps) {
  const { theme } = useAppTheme();
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [active, progress]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.line,
        {
          left: inset,
          right: inset,
          backgroundColor: color ?? theme.colors.accent,
          opacity: progress,
          transform: [{ scaleX: progress }],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    bottom: 0,
    height: 1.5,
  },
});
