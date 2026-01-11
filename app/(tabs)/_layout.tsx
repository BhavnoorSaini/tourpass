import React from 'react';
import {Tabs, Redirect} from 'expo-router';
import {IconSymbol} from "@/components/ui/icon-symbol";
import { useAuth } from "@/providers/AuthProvider";

export default function TabsLayout() {
    const { user, initializing } = useAuth();

    if (initializing) {
        return null;
    }

    if (!user) {
        return <Redirect href="/(auth)/sign-in" />
    }

    return (
        <Tabs screenOptions={{ tabBarShowLabel: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <IconSymbol
                            size={focused ? 26 : 24}
                            name="house.fill"
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
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
    )
}