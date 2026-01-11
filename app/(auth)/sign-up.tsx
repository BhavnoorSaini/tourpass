import { useState } from 'react';
import { Link, Redirect } from 'expo-router';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';

export default function SignUp() {
  const { signUp, user, initializing } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      Alert.alert('Missing info', 'First and last name are required.');
      return;
    }

    setLoading(true);
    try {
      await signUp(trimmedEmail, password, trimmedFirst, trimmedLast);
      Alert.alert('Check your inbox', 'Verify your email to complete sign up.');
    } catch (err: any) {
      Alert.alert('Sign up failed', err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 gap-4 bg-white">
      <View className="gap-2">
        <Text className="text-2xl font-semibold">Create account</Text>
        <Text className="text-gray-500">Sign up to get started</Text>
      </View>

      <View className="gap-3">
        <View className="gap-2">
          <Text className="text-gray-700">First name</Text>
          <TextInput
            className="border border-gray-300 rounded px-3 py-2"
            autoCapitalize="words"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Jane"
          />
        </View>
        <View className="gap-2">
          <Text className="text-gray-700">Last name</Text>
          <TextInput
            className="border border-gray-300 rounded px-3 py-2"
            autoCapitalize="words"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Doe"
          />
        </View>
        <View className="gap-2">
          <Text className="text-gray-700">Email</Text>
          <TextInput
            className="border border-gray-300 rounded px-3 py-2"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
          />
        </View>
        <View className="gap-2">
          <Text className="text-gray-700">Password</Text>
          <TextInput
            className="border border-gray-300 rounded px-3 py-2"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="********"
          />
        </View>
      </View>

      <Pressable
        className="bg-blue-600 rounded-md items-center justify-center h-12"
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Sign up</Text>}
      </Pressable>

      <View className="flex-row justify-center gap-2">
        <Text className="text-gray-600">Already have an account?</Text>
        <Link href="/(auth)/sign-in" className="text-blue-600 font-semibold">Sign in</Link>
      </View>
    </View>
  );
}
