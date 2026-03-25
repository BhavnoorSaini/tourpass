import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#0B1D3A' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: '600' },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="become-guide" options={{ headerShown: false, presentation:'modal'}} />
            <Stack.Screen name="help-center/index" options={{ title: 'Help Center' }} />
            <Stack.Screen name="payments/index" options={{ title: 'Payments' }} />
            <Stack.Screen name="preferences/index" options={{ title: 'Preferences' }} />
            <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
        </Stack>
    );
}