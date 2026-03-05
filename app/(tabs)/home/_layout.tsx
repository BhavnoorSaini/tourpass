import { Stack } from 'expo-router';

export default function HomeLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen
                name="tour"
                options={{
                    animation: 'slide_from_bottom',
                }}
            />
        </Stack>
    );
}

