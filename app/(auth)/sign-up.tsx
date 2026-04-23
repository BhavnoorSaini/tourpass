import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, Redirect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { PressableButton } from '@/components/ui/PressableButton';
import { StyledTextInput } from '@/components/ui/StyledTextInput';

export default function SignUp() {
  const { signUp, user, initializing } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (initializing) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.text} />
      </View>
    );
  }

  if (user) return <Redirect href="/(tabs)/home" />;

  const handleSubmit = async () => {
    const f = firstName.trim();
    const l = lastName.trim();
    const e = email.trim();

    if (!f || !l || !e || !password) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await signUp(e, password, f, l);
      Alert.alert(
        'Verify',
        'Check your inbox for a verification link.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }],
      );
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.root, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[typography.labelS, styles.wordmark, { color: theme.accent }]}>
            TOURPASS
          </Text>

          <View style={styles.headlineBlock}>
            <Text style={[typography.displayL, { color: theme.text }]}>
              Register
            </Text>
          </View>

          <View style={styles.fields}>
            <View style={styles.nameRow}>
              <StyledTextInput
                label="First"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                style={{ flex: 1 }}
              />
              <StyledTextInput
                label="Last"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                style={{ flex: 1 }}
              />
            </View>
            <StyledTextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{ marginTop: spacing.sm }}
            />
            <StyledTextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <PressableButton
            label="Create account"
            onPress={handleSubmit}
            loading={loading}
          />

          <View style={styles.footer}>
            <Text style={[typography.bodyS, { color: theme.textSecondary }]}>Joined before? </Text>
            <Link href="/(auth)/sign-in">
              <Text style={[typography.bodyS, { color: theme.accent, fontWeight: '600' }]}>
                Sign in
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    flex: 1,
  },
  wordmark: {
    marginBottom: spacing.md,
    letterSpacing: 2,
  },
  headlineBlock: {
    marginBottom: spacing.xxl,
  },
  fields: {
    marginBottom: spacing.xl,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
