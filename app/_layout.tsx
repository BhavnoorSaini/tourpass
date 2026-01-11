import { Stack } from "expo-router";
import './global.css';
import {SafeAreaProvider} from "react-native-safe-area-context";
import { AuthProvider } from "@/providers/AuthProvider";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <Stack>
                    <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="(auth)"
                        options={{ headerShown: false }}
                    />
                </Stack>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
