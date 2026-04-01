import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { supabase } from '@/lib/supabase';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

export default function EditProfileScreen() {
  const styles = useThemedStyles(createStyles);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setFirstName(user?.user_metadata?.first_name || '');
      setLastName(user?.user_metadata?.last_name || '');
    };

    void loadUserData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: trimmedFirst,
          last_name: trimmedLast,
        },
      });

      if (authError) {
        throw authError;
      }

      if (user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: trimmedFirst,
            last_name: trimmedLast,
          })
          .eq('id', user.id);

        if (profileError) {
          throw profileError;
        }
      }

      Alert.alert('Profile updated', 'Your details have been saved.');
    } catch (error) {
      Alert.alert(
        'Unable to save',
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
        eyebrow="Edit profile"
        title="Keep the essentials current and readable."
        subtitle="Only the details that matter live here."
      />

      <AppSection title="Identity" subtitle="The name shown across your profile">
        <View style={styles.stack}>
          <AppInput
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
          />
          <AppInput
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
          />
          <AppButton
            label="Save changes"
            onPress={handleSave}
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
      minWidth: 180,
    },
  });
