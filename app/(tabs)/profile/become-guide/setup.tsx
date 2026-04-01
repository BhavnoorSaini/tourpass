import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppInput } from '@/components/ui/AppInput';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { supabase } from '@/lib/supabase';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

export default function GuideSetupScreen() {
  const styles = useThemedStyles(createStyles);
  const [primaryCity, setPrimaryCity] = useState('');
  const [languagesSpoken, setLanguagesSpoken] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Not Signed In', 'You must be signed in to apply.');
      return;
    }

    setSubmitting(true);

    const languagesArray = languagesSpoken
      .split(',')
      .map((language) => language.trim())
      .filter(Boolean);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        primary_city: primaryCity.trim() || null,
        languages_spoken: languagesArray.length > 0 ? languagesArray : null,
        bio: bio.trim() || null,
      })
      .eq('id', user.id);

    if (profileError) {
      setSubmitting(false);
      Alert.alert('Submission Failed', profileError.message);
      return;
    }

    const { error: statusError } = await supabase.rpc('submit_guide_application');

    if (statusError) {
      setSubmitting(false);
      Alert.alert('Submission Failed', statusError.message);
      return;
    }

    setSubmitting(false);
    router.push('/profile/become-guide/setup_completed');
  };

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppHeader
        backVisible
        eyebrow="Guide setup"
        title="Add the details that help travelers choose you."
      />

      <AppSection title="Guide profile" subtitle="Only the information needed for the application">
        <View style={styles.stack}>
          <AppInput
            label="Primary city"
            value={primaryCity}
            onChangeText={setPrimaryCity}
            placeholder="Chicago, Illinois"
          />
          <AppInput
            label="Languages spoken"
            value={languagesSpoken}
            onChangeText={setLanguagesSpoken}
            placeholder="English, Spanish"
          />
          <AppInput
            label="Bio and expertise"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell travelers what you know best."
            multiline
          />
          <AppButton
            label="Submit application"
            onPress={handleSubmit}
            loading={submitting}
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
      minWidth: 210,
    },
  });
