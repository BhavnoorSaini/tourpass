import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LEGAL_DOCUMENT_ORDER,
  LEGAL_DOCUMENTS,
  type LegalDocumentId,
} from '@/constants/legal';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

function DocumentRow({
  documentId,
  isLast = false,
}: {
  documentId: LegalDocumentId;
  isLast?: boolean;
}) {
  const router = useRouter();
  const theme = useTheme();
  const document = LEGAL_DOCUMENTS[documentId];
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      onPress={() => router.push(`/profile/settings/legal/${document.id}`)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.row,
        {
          backgroundColor: pressed ? theme.surfaceRaised : 'transparent',
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.background,
        },
      ]}
    >
      <View style={styles.rowCopy}>
        <Text style={[typography.bodyM, { color: theme.text }]}>{document.title}</Text>
        <Text style={[typography.bodyS, styles.rowSummary, { color: theme.textSecondary }]}>
          {document.summary}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function DataPrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ScreenHeader title="Data & Privacy" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      >
        <View style={styles.hero}>
          <Text style={[typography.labelS, { color: theme.accent }]}>Legal Documents</Text>
          <Text style={[typography.headingL, styles.heroTitle, { color: theme.text }]}>
            Data & Privacy
          </Text>
          <Text style={[typography.bodyM, styles.heroBody, { color: theme.textSecondary }]}>
            Review how TourPass handles account data, location services, and Mapbox-supported
            routing, plus the terms that apply when you use the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.labelS, styles.sectionLabel, { color: theme.textSecondary }]}>
            Documents
          </Text>
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            {LEGAL_DOCUMENT_ORDER.map((documentId, index) => (
              <DocumentRow
                key={documentId}
                documentId={documentId}
                isLast={index === LEGAL_DOCUMENT_ORDER.length - 1}
              />
            ))}
          </View>
        </View>

        <View style={styles.noteBox}>
          <Text style={[typography.bodyS, { color: theme.textSecondary }]}>
            TourPass uses location permissions for map and navigation features. Mapbox may process
            search, route, coordinate, telemetry, and related technical data when those services
            are used.
          </Text>
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
  heroBody: {
    marginTop: spacing.sm,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionLabel: {
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 2,
    gap: spacing.md,
  },
  rowCopy: {
    flex: 1,
  },
  rowSummary: {
    marginTop: 2,
  },
  noteBox: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
});
