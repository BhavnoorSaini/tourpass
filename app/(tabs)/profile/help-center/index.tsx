import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppListRow } from '@/components/ui/AppListRow';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

export default function HelpCenterScreen() {
  const styles = useThemedStyles(createStyles);

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppHeader
        backVisible
        eyebrow="Help"
        title="Support stays short, direct, and easy to find."
        subtitle="Choose the path that matches what you need right now."
      />

      <AppSection title="Support paths" subtitle="Three focused ways to get unblocked">
        <View style={styles.stack}>
          <AppListRow
            title="FAQs"
            subtitle="Quick answers to common account and tour questions."
            icon="help-circle-outline"
            onPress={() => router.push('/profile/help-center/faq')}
          />
          <AppListRow
            title="Contact support"
            subtitle="Send a direct note when you need human help."
            icon="mail-outline"
            onPress={() => router.push('/profile/help-center/contact')}
          />
          <AppListRow
            title="Report a bug"
            subtitle="Describe a product issue so it can be fixed."
            icon="bug-outline"
            onPress={() => router.push('/profile/help-center/report_bug')}
          />
        </View>
      </AppSection>
    </AppScreen>
  );
}

const createStyles = (_theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    screen: {
      paddingTop: 16,
    },
    stack: {
      gap: 16,
    },
  });
