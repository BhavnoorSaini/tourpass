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
import { Link, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { PressableButton } from '@/components/ui/PressableButton';
import { StyledTextInput } from '@/components/ui/StyledTextInput';

export default function SignIn() {
  const { signIn, user, initializing } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
    if (!email || !password) {
      Alert.alert('Required', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Sign in failed.');
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
              Sign in
            </Text>
          </View>

          <View style={styles.fields}>
            <StyledTextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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
            label="Continue"
            onPress={handleSubmit}
            loading={loading}
          />

          <View style={styles.footer}>
            <Text style={[typography.bodyS, { color: theme.textSecondary }]}>New here? </Text>
            <Link href="/(auth)/sign-up">
              <Text style={[typography.bodyS, { color: theme.accent, fontWeight: '600' }]}>
                Create account
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
