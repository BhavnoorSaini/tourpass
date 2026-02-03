import { useState } from 'react';
import { Link, Redirect } from 'expo-router';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { ImageBackground } from 'react-native';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';

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
      <ImageBackground
          source={require('@/assets/images/tourpassbackgroundsignup.png')}
          resizeMode="cover"
          className="flex-1"
      >
    <View className="flex-1 justify-center px-6 gap-4 bg-white/10">
      <View className="gap-2">
        <Text className="text-2xl font-semibold text-gray-100">Create account</Text>
        <Text className="text-gray-100">Sign up to get started</Text>
      </View>

      <View className=" gap-3">
        <View className="gap-2">

          <Text className="text-gray-100">First name</Text>
          <LiquidGlassView
              effect="regular"
              interactive
              tintColor="rgba(173,216,230,0.25)"
              style={{
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
          >

          <TextInput
            className="text-white"
            autoCapitalize="words"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Jane"
            placeholderTextColor="rgba(255,255,255,0.6)"
          />
          </LiquidGlassView>
        </View>


        <View className="gap-2">
          <Text className="text-gray-100">Last name</Text>
          <LiquidGlassView
              effect="regular"
              interactive
              tintColor="rgba(173,216,230,0.25)"
              style={{
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
          >
          <TextInput
            className="text-white"
            autoCapitalize="words"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Doe"
            placeholderTextColor="rgba(255,255,255,0.6)"
          />
          </LiquidGlassView>
        </View>


        <View className="gap-2">
          <Text className="text-gray-100">Email</Text>
          <LiquidGlassView
              effect="regular"
              interactive
              tintColor="rgba(173,216,230,0.25)"
              style={{
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
          >
          <TextInput
            className="text-white"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="rgba(255,255,255,0.6)"
          />
          </LiquidGlassView>
        </View>



        <View className="gap-2">
          <Text className="text-gray-100">Password</Text>
          <LiquidGlassView
              effect="regular"
              interactive
              tintColor="rgba(173,216,230,0.25)"
              style={{
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
          >
          <TextInput
            className="text-white"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            placeholderTextColor="rgba(255,255,255,0.6)"
          />
          </LiquidGlassView>
        </View>
      </View>

      <LiquidGlassView
          style={{
            height: 48,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          effect="regular"
          interactive
          tintColor="rgba(0, 122, 255, 0.35)" // iOS blue
      >
        <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          {loading ? (
              <ActivityIndicator />
          ) : (
              <Text className="text-white font-semibold">Sign in</Text>
          )}
        </Pressable>
      </LiquidGlassView>

      <View className="flex-row justify-center gap-2">
        <Text className="text-gray-100">Already have an account?</Text>
        <Link href="/(auth)/sign-in" className="text-blue-600 font-semibold">Sign in</Link>
      </View>
    </View>
      </ImageBackground>
  );
}
