import { useState } from 'react';
import { Link, Redirect, useRouter } from 'expo-router';
import { View, Text, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';

export default function SignUp() {
    const { signUp, user, initializing } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);

    if (initializing) {
        return (
            <View className="flex-1 items-center justify-center bg-[#0B1D3A]">
                <ActivityIndicator color="white" />
            </View>
        );
    }

    if (user) {
        return <Redirect href="/(tabs)/home" />;
    }

    const handleSubmit = async () => {
        const trimmedEmail = email.trim();
        const trimmedFirst = firstName.trim();
        const trimmedLast = lastName.trim();

        if (!trimmedFirst || !trimmedLast || !trimmedEmail || !password) {
            Alert.alert('Missing info', 'All fields are required.');
            return;
        }

        setLoading(true);
        try {
            await signUp(trimmedEmail, password, trimmedFirst, trimmedLast);
            Alert.alert(
                'Check your inbox',
                'Verify your email to complete sign up.',
                [{ text: "OK", onPress: () => router.replace('/(auth)/sign-in') }]
            );
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
            <View className="flex-1 justify-center px-6 gap-4 bg-black/30">
                <View className="gap-2">
                    <Text className="text-2xl font-semibold text-white">Create account</Text>
                    <Text className="text-gray-200">Sign up to get started</Text>
                </View>

                <View className="gap-3">
                    <AuthInput
                        label="First name"
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Jane"
                        autoCapitalize="words"
                    />

                    <AuthInput
                        label="Last name"
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Doe"
                        autoCapitalize="words"
                    />

                    <AuthInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <AuthInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="********"
                        secureTextEntry
                    />
                </View>

                <AuthButton
                    title="Sign up"
                    onPress={handleSubmit}
                    loading={loading}
                />

                <View className="flex-row justify-center gap-2 mt-4">
                    <Text className="text-gray-100">Already have an account?</Text>
                    <Link href="/(auth)/sign-in" className="text-blue-400 font-bold">Sign in</Link>
                </View>
            </View>
        </ImageBackground>
    );
}