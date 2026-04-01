import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

export default function SetupCompletedScreen() {
  const styles = useThemedStyles(createStyles);

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppHeader
        backVisible
        eyebrow="Application sent"
        title="Your guide profile is now in review."
      />

      <AppSection title="What happens next" subtitle="A simple handoff after submission">
        <View style={styles.stack}>
          <AppText variant="body">
            The team will review your profile and route details. This usually takes 24 to 48 hours.
          </AppText>
          <AppButton
            label="Return to profile"
            onPress={() => router.dismissTo('/profile')}
            style={styles.button}
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
      justifyContent: 'center',
    },
    stack: {
      gap: 16,
    },
    button: {
      alignSelf: 'flex-start',
      minWidth: 180,
    },
  });
