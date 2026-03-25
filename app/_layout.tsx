import { Stack } from "expo-router";
import './global.css';
import {SafeAreaProvider} from "react-native-safe-area-context";
import { AuthProvider } from "@/providers/AuthProvider";
import { PreferencesProvider } from "../contexts/PreferencesContext";
import { RoutesProvider } from "@/contexts/RoutesContext";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <PreferencesProvider>
                    <RoutesProvider>
                        <Stack screenOptions={{ headerShown: false }} />
                    </RoutesProvider>
                </PreferencesProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
