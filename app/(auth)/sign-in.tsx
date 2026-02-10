import { useState } from 'react';
import { Link, Redirect } from 'expo-router';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { LiquidGlassView } from '@callstack/liquid-glass';

export default function SignIn() {
    const { signIn, user, initializing } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        if (!email || !password) {
            Alert.alert("Error", "Please enter email and password");
            return;
        }
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
            source={require('@/assets/images/signin_backgroundv2.png')}
            resizeMode="cover"
            className="flex-1"
        >
            <View className="flex-1 justify-end px-6 pb-12 gap-4 bg-black/20">
                <View className="gap-2">
                    <Text className="text-2xl font-semibold text-white">Welcome back</Text>
                    <Text className="text-gray-300">Sign in to continue</Text>
                </View>
                <View className="gap-3">
                    <View className="gap-2">
                        <Text className="text-white/80">Email</Text>
                        <LiquidGlassView
                            effect="regular"
                            interactive
                            tintColor="rgba(173,216,230,0.25)"
                            style={{ borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, height: 50, justifyContent: 'center' }}
                        >
                            <TextInput
                                className="text-white h-full"
                                placeholder="you@example.com"
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </LiquidGlassView>
                    </View>

                    <View className="gap-2">
                        <Text className="text-white/80">Password</Text>
                        <LiquidGlassView
                            effect="regular"
                            interactive
                            tintColor="rgba(173,216,230,0.25)"
                            style={{ borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, height: 50, justifyContent: 'center' }}
                        >
                            <TextInput
                                className="text-white h-full"
                                placeholder="********"
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
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
                            <Text className="text-white font-semibold text-lg">Sign in</Text>
                        )}
                    </Pressable>
                </LiquidGlassView>

                <View className="flex-row justify-center gap-2 mt-4">
                    <Text className="text-gray-300">No account?</Text>
                    <Link href="/(auth)/sign-up" className="text-blue-400 font-bold">Sign up</Link>
                </View>
            </View>
        </ImageBackground>
    );
}