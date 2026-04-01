import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

export default function GuideIntroScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppHeader
        backVisible
        eyebrow="Become a guide"
        title="Turn local knowledge into a route-led presence."
        subtitle="The guide flow stays intentionally short: apply, set up, publish."
      />

      <AppSection title="Why guide?" subtitle="Three reasons without extra sales language">
        <View style={styles.stack}>
          <View style={styles.reasonRow}>
            <AppText variant="label">01</AppText>
            <View style={styles.reasonCopy}>
              <AppText variant="title">Work on your schedule</AppText>
              <AppText variant="body">Choose when you host and how often you publish tours.</AppText>
            </View>
          </View>
          <View style={styles.reasonRow}>
            <AppText variant="label">02</AppText>
            <View style={styles.reasonCopy}>
              <AppText variant="title">Share the places that matter</AppText>
              <AppText variant="body">Build routes from details only locals usually notice.</AppText>
            </View>
          </View>
          <View style={styles.reasonRow}>
            <AppText variant="label">03</AppText>
            <View style={styles.reasonCopy}>
              <AppText variant="title">Get paid for the route itself</AppText>
              <AppText variant="body">Once tours are live, travelers can request them directly.</AppText>
            </View>
          </View>
        </View>
      </AppSection>

      <AppButton
        label="Start application"
        onPress={() => router.push('/profile/become-guide/setup')}
        style={styles.button}
      />
    </AppScreen>
  );
}

const createStyles = (_theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    screen: {
      paddingTop: 16,
    },
    stack: {
      gap: 24,
    },
    reasonRow: {
      flexDirection: 'row',
      gap: 16,
    },
    reasonCopy: {
      flex: 1,
      gap: 4,
    },
    button: {
      alignSelf: 'flex-start',
      minWidth: 190,
    },
  });
