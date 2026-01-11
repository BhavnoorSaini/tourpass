import { Tabs } from "expo-router";

export default function AuthLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: { display: 'none' },
                tabBarButton: () => null,
            }}
        >
            <Tabs.Screen
                name="sign-in"
                options={{
                    title: "Sign In",
                    tabBarLabel: "Sign In",
                }}
            />
            <Tabs.Screen
                name="sign-up"
                options={{
                    title: "Sign Up",
                    tabBarLabel: "Sign Up",
                }}
            />
        </Tabs>
    );
}
