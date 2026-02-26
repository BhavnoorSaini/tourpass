import { useState } from 'react';
import { Link, Redirect, useRouter } from 'expo-router';
import { ScrollView, View, Text, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator color="#0284C7" size="large" />
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
            Alert.alert('Missing info', 'Please fill out all fields to continue.');
            return;
        }

        setLoading(true);
        try {
            await signUp(trimmedEmail, password, trimmedFirst, trimmedLast);
            Alert.alert(
                'Check your inbox',
                'We sent you a verification link. Please verify your email to complete sign up.',
                [{ text: "OK", onPress: () => router.replace('/(auth)/sign-in') }]
            );
        } catch (err: any) {
            Alert.alert('Sign up failed', err.message ?? 'Unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#0F172A', '#020617', '#000000']}
            style={{ flex: 1 }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 40 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="px-8 w-full max-w-md mx-auto gap-8 mt-8">
                        {/* Header Section */}
                        <View className="gap-2">
                            <Text className="text-4xl font-bold text-white tracking-tight">
                                Create{'\n'}account.
                            </Text>
                            <Text className="text-base text-white/60">
                                Join us to get started
                            </Text>
                        </View>

                        {/* Input Section */}
                        <View className="gap-4">
                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <AuthInput
                                        label="First name"
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        placeholder="Jane"
                                        autoCapitalize="words"
                                    />
                                </View>
                                <View className="flex-1">
                                    <AuthInput
                                        label="Last name"
                                        value={lastName}
                                        onChangeText={setLastName}
                                        placeholder="Doe"
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>

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
                                placeholder="••••••••"
                                secureTextEntry
                            />
                        </View>

                        {/* Action Section */}
                        <View className="gap-6 mt-4">
                            <AuthButton
                                title="Sign up"
                                onPress={handleSubmit}
                                loading={loading}
                            />
                            <View className="flex-row justify-center items-center gap-2">
                                <Text className="text-white/60 font-medium">Already have an account?</Text>
                                {/* Changed from Purple to a vibrant light blue */}
                                <Link href="/(auth)/sign-in" className="text-[#38BDF8] font-bold text-base">
                                    Sign in
                                </Link>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}