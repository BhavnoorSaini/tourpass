import { useState } from 'react';
import { Link, Redirect, useRouter } from 'expo-router';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { LiquidGlassView } from '@callstack/liquid-glass';

export default function SignUp() {
    const { signUp, user, initializing } = useAuth();
    const router = useRouter(); // Helper for navigation
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

    // If user is already authenticated, direct them to home
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
                [
                    { text: "OK", onPress: () => router.replace('/(auth)/sign-in') }
                ]
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
                    <View className="gap-2">
                        <Text className="text-gray-100">First name</Text>
                        <LiquidGlassView
                            effect="regular"
                            interactive
                            tintColor="rgba(173,216,230,0.25)"
                            style={{ borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, height: 50, justifyContent: 'center' }}
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
                            style={{ borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, height: 50, justifyContent: 'center' }}
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
                            style={{ borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, height: 50, justifyContent: 'center' }}
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
                            style={{ borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, height: 50, justifyContent: 'center' }}
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
                    style={{ height: 48, borderRadius: 12, overflow: 'hidden', marginTop: 10 }}
                    effect="regular"
                    interactive
                    tintColor="rgba(0, 122, 255, 0.5)"
                >
                    <Pressable
                        onPress={handleSubmit}
                        disabled={loading}
                        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-semibold text-lg">Sign up</Text>
                        )}
                    </Pressable>
                </LiquidGlassView>

                <View className="flex-row justify-center gap-2 mt-4">
                    <Text className="text-gray-100">Already have an account?</Text>
                    <Link href="/(auth)/sign-in" className="text-blue-400 font-bold">Sign in</Link>
                </View>
            </View>
        </ImageBackground>
    );
}