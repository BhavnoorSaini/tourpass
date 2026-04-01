import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { supabase } from '@/lib/supabase';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

export default function ChangePasswordScreen() {
  const styles = useThemedStyles(createStyles);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please enter the same password twice.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Password too short', 'Use at least six characters.');
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      Alert.alert('Password updated', 'Your password has been changed.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert(
        'Unable to update',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppHeader
        backVisible
        eyebrow="Password"
        title="Update your sign-in credentials without opening a modal."
        subtitle="Keep the flow simple and direct."
      />

      <AppSection title="Security" subtitle="Use the same password twice before saving">
        <View style={styles.stack}>
          <AppInput
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            secureTextEntry
          />
          <AppInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
          />
          <AppButton
            label="Update password"
            onPress={handleUpdate}
            loading={saving}
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
      minWidth: 200,
    },
  });
