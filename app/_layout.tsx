import { Stack, Link } from "expo-router";
import './global.css';
import {SafeAreaProvider} from "react-native-safe-area-context";
import { AuthProvider } from "@/providers/AuthProvider";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
