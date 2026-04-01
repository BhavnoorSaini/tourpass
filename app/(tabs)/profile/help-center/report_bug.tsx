import { Alert, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

export default function ReportBugScreen() {
  const styles = useThemedStyles(createStyles);
  const [details, setDetails] = useState('');

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppHeader
        backVisible
        eyebrow="Bug report"
        title="Capture what broke in one precise description."
      />

      <AppSection title="Report a bug" subtitle="A clean handoff for your future bug submission flow">
        <View style={styles.stack}>
          <AppText variant="body">
            Include the action you took, what you expected, and what the app did instead.
          </AppText>
          <AppInput
            value={details}
            onChangeText={setDetails}
            placeholder="What happened?"
            multiline
          />
          <AppButton
            label="Submit bug"
            variant="danger"
            onPress={() => {
              setDetails('');
              Alert.alert('Bug submitted', 'Bug submission can be connected here.');
            }}
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
    },
    stack: {
      gap: 16,
    },
    button: {
      alignSelf: 'flex-start',
      minWidth: 170,
    },
  });
