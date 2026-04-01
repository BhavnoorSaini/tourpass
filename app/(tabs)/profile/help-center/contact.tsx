import { Alert, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

export default function ContactSupportScreen() {
  const styles = useThemedStyles(createStyles);
  const [message, setMessage] = useState('');

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppHeader
        backVisible
        eyebrow="Support"
        title="Send one clear message and keep the issue specific."
      />

      <AppSection title="Contact support" subtitle="The message body can be connected to your backend later">
        <View style={styles.stack}>
          <AppText variant="body">
            Describe what happened, what you expected, and where you got stuck.
          </AppText>
          <AppInput
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue"
            multiline
          />
          <AppButton
            label="Send message"
            onPress={() => {
              setMessage('');
              Alert.alert('Message sent', 'Support submission can be connected here.');
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
      minWidth: 180,
    },
  });
