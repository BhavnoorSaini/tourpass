import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="become-guide" options={{ presentation: 'modal' }} />
            <Stack.Screen name="help-center" />
            <Stack.Screen name="payments/index" />
            <Stack.Screen name="preferences/index" />
            <Stack.Screen name="settings/index" />
        </Stack>
    );
}
