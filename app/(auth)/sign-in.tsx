import { useState } from 'react';
import { Link, Redirect } from 'expo-router';
import { ScrollView, View, Text, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/providers/AuthProvider';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';

export default function SignIn() {
    const { signIn, user, initializing } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        if (!email || !password) {
            Alert.alert("Error", "Please enter your email and password.");
            return;
        }
        setLoading(true);
        try {
            await signIn(email.trim(), password);
        } catch (err: any) {
            Alert.alert('Sign in failed', err.message ?? 'Unknown error occurred.');
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
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="px-8 w-full max-w-md mx-auto gap-8">
                        {/* Header Section */}
                        <View className="gap-2 mt-12">
                            <Text className="text-4xl font-bold text-white tracking-tight">
                                Welcome{'\n'}back.
                            </Text>
                            <Text className="text-base text-white/60">
                                Sign in to continue your journey
                            </Text>
                        </View>

                        {/* Input Section */}
                        <View className="gap-4">
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
                                title="Sign in"
                                onPress={handleSubmit}
                                loading={loading}
                            />
                            <View className="flex-row justify-center items-center gap-2">
                                <Text className="text-white/60 font-medium">New around here?</Text>
                                {/* Changed from Purple to a vibrant light blue */}
                                <Link href="/(auth)/sign-up" className="text-[#38BDF8] font-bold text-base">
                                    Create account
                                </Link>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}