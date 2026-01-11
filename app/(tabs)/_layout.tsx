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
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarItemStyle: {
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    borderRadius: 20,
                    marginHorizontal: 80,
                    marginBottom: 20,
                    height: 48,
                    position: 'absolute',
                    overflow: 'hidden',
                    borderWidth: 0,
                    backgroundColor: '#FFFFFF',
                    paddingBottom: 4,
                    paddingTop: 4,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: 8,
                }
            }}
        >
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