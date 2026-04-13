import type { ReactNode } from 'react';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useTheme } from '@/constants/theme';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface HelpScreenLayoutProps {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function HelpScreenLayout({
  title,
  eyebrow,
  description,
  children,
  footer,
}: HelpScreenLayoutProps) {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ScreenHeader title={title} onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
      >
        <View style={[styles.hero, { backgroundColor: theme.surface }]}>
          <Text style={[typography.labelS, { color: theme.accent }]}>{eyebrow}</Text>
          <Text style={[typography.headingM, styles.heroTitle, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[typography.bodyM, styles.heroDescription, { color: theme.textSecondary }]}>
            {description}
          </Text>
        </View>

        <View style={styles.content}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </View>
  );
}

export function HelpSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[typography.labelS, styles.sectionLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  hero: {
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  heroTitle: {
    marginTop: spacing.xs,
  },
  heroDescription: {
    marginTop: spacing.sm,
  },
  content: {
    marginTop: spacing.xl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    marginLeft: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
});
