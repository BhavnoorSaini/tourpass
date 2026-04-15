import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegalDocument } from '@/constants/legal';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export function LegalDocumentView({ document }: { document: LegalDocument }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ScreenHeader title={document.title} onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      >
        <View style={styles.hero}>
          <Text style={[typography.labelS, { color: theme.accent }]}>Legal</Text>
          <Text style={[typography.headingL, styles.heroTitle, { color: theme.text }]}>
            {document.title}
          </Text>
          <Text style={[typography.bodyM, styles.heroSummary, { color: theme.textSecondary }]}>
            {document.summary}
          </Text>
          <Text style={[typography.bodyS, { color: theme.textSecondary }]}>
            Last updated {document.lastUpdated}
          </Text>
        </View>

        <View style={styles.sections}>
          {document.sections.map((section) => (
            <View
              key={section.title}
              style={[styles.sectionCard, { backgroundColor: theme.surface }]}
            >
              <Text style={[typography.headingS, styles.sectionTitle, { color: theme.text }]}>
                {section.title}
              </Text>
              {section.body.map((paragraph) => (
                <Text
                  key={paragraph}
                  style={[typography.bodyM, styles.paragraph, { color: theme.textSecondary }]}
                >
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  heroTitle: {
    marginTop: spacing.sm,
  },
  heroSummary: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sections: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  sectionCard: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  paragraph: {
    marginTop: spacing.sm,
  },
});
