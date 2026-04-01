import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppListRow } from '@/components/ui/AppListRow';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { AppText } from '@/components/ui/AppText';
import { supabase } from '@/lib/supabase';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserEmail(user?.email || 'Guest');
      } catch (error) {
        console.log('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    void getUserProfile();
  }, []);

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete profile',
      'This will permanently remove your profile data and sign you out.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              const {
                data: { user },
              } = await supabase.auth.getUser();

              if (!user) {
                throw new Error('No active user found.');
              }

              const { error: deleteError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', user.id);

              if (deleteError) {
                throw deleteError;
              }

              await supabase.auth.signOut();
              router.replace('/');
            } catch (error) {
              Alert.alert(
                'Delete failed',
                error instanceof Error ? error.message : 'Please try again.',
              );
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppHeader
        backVisible
        eyebrow="Settings"
        title="Control security, privacy, and account actions from one quiet place."
        subtitle="Secondary options stay grouped and easy to scan."
      />

      <AppSection title="Account" subtitle="Profile and password controls">
        <View style={styles.stack}>
          <AppListRow
            title="Edit profile"
            subtitle="Change your name and personal details."
            icon="person-outline"
            onPress={() => router.push('/profile/settings/edit-profile')}
          />
          <AppListRow
            title="Change password"
            subtitle="Update your sign-in credentials."
            icon="lock-closed-outline"
            onPress={() => router.push('/profile/settings/password')}
          />
        </View>
      </AppSection>

      <AppSection title="Privacy" subtitle="Current placeholder controls for future policy flows">
        <View style={styles.stack}>
          <AppListRow
            title="Location sharing"
            subtitle="Currently configured for active tour use."
            value="Always"
            icon="location-outline"
            onPress={() => Alert.alert('Coming soon', 'Location controls can be wired here.')}
          />
          <AppListRow
            title="Data privacy"
            subtitle="Terms, retention, and consent settings."
            icon="shield-checkmark-outline"
            onPress={() => Alert.alert('Coming soon', 'Privacy settings can be wired here.')}
          />
        </View>
      </AppSection>

      <AppSection title="Notifications" subtitle="Placeholder controls for messaging preferences">
        <View style={styles.stack}>
          <AppListRow
            title="Push notifications"
            subtitle="Update device notifications for messages and tours."
            icon="notifications-outline"
            onPress={() => Alert.alert('Coming soon', 'Notification settings can be wired here.')}
          />
          <AppListRow
            title="Email preferences"
            subtitle="Choose which account emails you receive."
            icon="mail-outline"
            onPress={() => Alert.alert('Coming soon', 'Email settings can be wired here.')}
          />
        </View>
      </AppSection>

      <AppSection title="About" subtitle="Versioning and policy details">
        <View style={styles.stack}>
          <AppListRow
            title="Version"
            subtitle="Build currently installed on this device."
            icon="information-circle-outline"
            value={Constants.expoConfig?.version ?? '1.0.0'}
            trailingChevron={false}
          />
          <AppListRow
            title="Terms of service"
            subtitle="Open the legal copy once it is connected."
            icon="document-text-outline"
            onPress={() => Alert.alert('Coming soon', 'Terms of service can be linked here.')}
          />
        </View>
      </AppSection>

      <AppSection title="Session" subtitle="Signed in account and irreversible actions">
        <View style={styles.stack}>
          <AppText variant="bodyStrong">{userEmail}</AppText>
          <AppButton
            label="Delete profile"
            variant="danger"
            onPress={handleDeleteProfile}
            style={styles.deleteButton}
          />
        </View>
      </AppSection>
    </AppScreen>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    loadingState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    screen: {
      paddingTop: 16,
    },
    stack: {
      gap: 16,
    },
    deleteButton: {
      alignSelf: 'flex-start',
      minWidth: 180,
    },
  });
