import { Stack } from "expo-router";

export default function GuideLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="setup" />
            <Stack.Screen name="setup_completed" />
        </Stack>
    );
}