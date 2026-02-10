import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/providers/AuthProvider";

export default function TabsLayout() {
    const { user, initializing } = useAuth();

    if (initializing) return null;
    if (!user) return <Redirect href="/(auth)/sign-in" />;

    return (
        <Tabs screenOptions={{ tabBarShowLabel: false, headerShown: false }}>
            {/* Home */}
            <Tabs.Screen
                name="home/index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <IconSymbol size={focused ? 26 : 24} name="house.fill" color={color} />
                    ),
                }}
            />

            {/* Feed Tab */}
            <Tabs.Screen
                name="feed/index"
                options={{
                    title: 'Feed',
                    tabBarIcon: ({ color, focused }) => (
                        <IconSymbol
                            size={focused ? 26 : 24}
                            name="newspaper.fill"
                            color={color}
                        />
                    ),
                }}
            />

            {/* Profile */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <IconSymbol
                            size={focused ? 26 : 24}
                            name="person.fill"
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}