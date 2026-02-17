import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function SettingsLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    contentStyle: { backgroundColor: '#111827' },
                    headerShown: false,
                }}
            >
                <Stack.Screen name="index" />
            </Stack>
        </>
    );
}