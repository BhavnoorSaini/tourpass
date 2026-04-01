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

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, user, initializing } = useAuth();
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password to continue.');
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert(
        'Sign in failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen contentContainerStyle={styles.screenContent}>
      <View style={styles.hero}>
        <AppText variant="eyebrow">Tourpass</AppText>
        <AppText variant="display" style={styles.heroTitle}>
          Move through cities with intention.
        </AppText>
        <AppText variant="body" style={styles.heroBody}>
          Sign in to browse routes, request local walks, and keep your next city close.
        </AppText>
      </View>

      <View style={styles.formBlock}>
        <View style={styles.formRow}>
          <AppText variant="label">Sign in</AppText>
          <AccentLine active inset={0} style={styles.headerLine} />
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
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>

        <AppButton
          label="Enter"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(auth)/sign-up')}
          style={styles.linkButton}
        >
          <AppText variant="caption">New here?</AppText>
          <AppText variant="button">Create account</AppText>
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
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
      paddingTop: theme.spacing.sm,
      maxWidth: 560,
    },
    heroTitle: {
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
      maxWidth: 320,
    },
    heroBody: {
      maxWidth: 320,
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
      right: '70%',
    },
    formFields: {
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
