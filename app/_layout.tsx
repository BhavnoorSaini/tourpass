import { Stack } from "expo-router";
import './global.css';
import {SafeAreaProvider} from "react-native-safe-area-context";
import { AuthProvider } from "@/providers/AuthProvider";
import { PreferencesProvider } from "../contexts/PreferencesContext";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <PreferencesProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                </PreferencesProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
