import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegalDocumentView } from '@/components/legal/LegalDocumentView';
import { LEGAL_DOCUMENTS, isLegalDocumentId } from '@/constants/legal';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function LegalDocumentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const params = useLocalSearchParams<{ document?: string | string[] }>();
  const documentParam = Array.isArray(params.document) ? params.document[0] : params.document;

  if (!documentParam || !isLegalDocumentId(documentParam)) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <ScreenHeader title="Legal" onBack={() => router.back()} />
        <View style={styles.emptyState}>
          <Text style={[typography.headingS, { color: theme.text }]}>Document not found</Text>
          <Text style={[typography.bodyM, styles.emptyCopy, { color: theme.textSecondary }]}>
            The legal document you requested is not available.
          </Text>
        </View>
      </View>
    );
  }

  return <LegalDocumentView document={LEGAL_DOCUMENTS[documentParam]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  emptyState: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  emptyCopy: {
    marginTop: spacing.sm,
  },
});
