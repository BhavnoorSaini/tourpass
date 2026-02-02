import { useState } from 'react';
import { Link, Redirect } from 'expo-router';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { ImageBackground } from 'react-native';

export default function SignIn() {
  const { signIn, user, initializing } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      Alert.alert('Sign in failed', err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
      <ImageBackground
          source={require('@/assets/images/Tourpassbackground.png')}
          resizeMode="cover"
          className="flex-1"
      >
    <View className="flex-1 justify-end px-6 pb-12 gap-4 bg-white/10">
      <View className="gap-2">
        <Text className="text-2xl font-semibold text-white">Welcome back</Text>
        <Text className="text-gray-500">Sign in to continue</Text>
      </View>

      <View className="gap-3">
        <View className="gap-2">
          <Text className="text-white/80">Email</Text>
          <TextInput
            className="border border-gray-300 rounded px-3 py-2"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder ="you@example.com"
            placeholderTextColor="rgba(255,255,255,0.6)"
          />
        </View>
        <View className="gap-2">
          <Text className="text-white/80">Password</Text>
          <TextInput
            className="border border-gray-300 rounded px-3 py-2"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            placeholderTextColor="rgba(255,255,255,0.6)"
          />
        </View>
      </View>

      <Pressable
        className="bg-blue-600 rounded-md items-center justify-center h-12"
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Sign in</Text>}
      </Pressable>

      <View className="flex-row justify-center gap-2">
        <Text className="text-gray-600">No account?</Text>
        <Link href="/(auth)/sign-up" className="text-blue-600 font-semibold">Sign up</Link>
      </View>
    </View>
      </ImageBackground>
  );
}

