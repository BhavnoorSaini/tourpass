import type { ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { AppSurface } from '@/components/ui/AppSurface';

interface AppSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  plain?: boolean;
}

export function AppSection({
  title,
  subtitle,
  children,
  style,
  contentStyle,
  plain = false,
}: AppSectionProps) {
  const content = <View style={contentStyle}>{children}</View>;

  return (
    <View style={[styles.section, style]}>
      <View style={styles.heading}>
        <AppText variant="sectionTitle">{title}</AppText>
        {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
      </View>

      {plain ? content : <AppSurface style={styles.surface}>{content}</AppSurface>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  heading: {
    marginBottom: 16,
    gap: 4,
  },
  surface: {
    padding: 16,
  },
});
