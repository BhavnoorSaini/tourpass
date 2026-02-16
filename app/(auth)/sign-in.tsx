import { useState } from 'react';
import { Link, Redirect } from 'expo-router';
import { ScrollView, View, Text, ActivityIndicator, Alert, ImageBackground } from 'react-native';
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
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
            <View className="flex-1 justify-end px-6 pb-12 gap-4 bg-black/20">
                <View className="gap-2">
                    <Text className="text-2xl font-semibold text-white">Welcome back</Text>
                    <Text className="text-gray-300">Sign in to continue</Text>
                </View>

                <View className="gap-3">
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
                    title="Sign in"
                    onPress={handleSubmit}
                    loading={loading}
                />

                <View className="flex-row justify-center gap-2 mt-4">
                    <Text className="text-gray-300">No account?</Text>
                    <Link href="/(auth)/sign-up" className="text-blue-400 font-bold">Sign up</Link>
                </View>
            </View>
            </ScrollView>
        </ImageBackground>
    );
}