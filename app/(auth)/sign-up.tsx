import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { useAuth } from '@/providers/AuthProvider';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, user, initializing } = useAuth();
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  if (initializing) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      Alert.alert('Missing details', 'Fill every field before creating your account.');
      return;
    }

    try {
      setLoading(true);
      await signUp(email.trim(), password, firstName.trim(), lastName.trim());
      Alert.alert(
        'Check your inbox',
        'We sent a verification email. Once you confirm it, you can sign in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }],
      );
    } catch (error) {
      Alert.alert(
        'Sign up failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen contentContainerStyle={styles.screenContent}>
      <View style={styles.hero}>
        <AppText variant="eyebrow">Create account</AppText>
        <AppText variant="display" style={styles.heroTitle}>
          Start with a quieter way to travel.
        </AppText>
        <AppText variant="body" style={styles.heroBody}>
          Build your profile, save routes, and book walks that feel chosen instead of crowded.
        </AppText>
      </View>

      <View style={styles.formBlock}>
        <View style={styles.formRow}>
          <AppText variant="label">Join Tourpass</AppText>
          <AccentLine active inset={0} style={styles.headerLine} />
        </View>

        <View style={styles.nameGrid}>
          <AppInput
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Jane"
            containerStyle={styles.nameField}
          />
          <AppInput
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Doe"
            containerStyle={styles.nameField}
          />
        </View>

        <View style={styles.formFields}>
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Choose a password"
            secureTextEntry
          />
        </View>

        <AppButton
          label="Create account"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(auth)/sign-in')}
          style={styles.linkButton}
        >
          <AppText variant="caption">Already registered?</AppText>
          <AppText variant="button">Sign in</AppText>
        </Pressable>
      </View>
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
    screenContent: {
      justifyContent: 'center',
      paddingTop: theme.spacing.lg,
    },
    hero: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      maxWidth: 560,
    },
    heroTitle: {
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
      maxWidth: 320,
    },
    heroBody: {
      maxWidth: 340,
    },
    formBlock: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    formRow: {
      marginBottom: theme.spacing.md,
      position: 'relative',
      paddingBottom: theme.spacing.sm,
    },
    headerLine: {
      bottom: 0,
      left: 0,
      right: '58%',
    },
    nameGrid: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    nameField: {
      flex: 1,
    },
    formFields: {
      marginTop: theme.spacing.xs,
      gap: theme.spacing.sm,
    },
    submitButton: {
      marginTop: theme.spacing.md,
    },
    linkButton: {
      marginTop: theme.spacing.sm,
      alignSelf: 'flex-start',
      gap: theme.spacing.xxs,
      paddingVertical: theme.spacing.xs,
    },
  });
