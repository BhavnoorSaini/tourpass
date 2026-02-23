import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/providers/AuthProvider";

export default function TabsLayout() {
    const { user, initializing } = useAuth();

    if (initializing) return null;
    if (!user) return <Redirect href="/(auth)/sign-in" />;

    return (
        <Tabs screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            //added some color to the tab bar
            tabBarStyle: {
                position: 'absolute',
                bottom: 20,
                elevation: 0,
                marginHorizontal: 10, //using marginal to move the bar in from the edges of the screen,
                //using left and right would cause the bar to stretch across the entire screen, not nice
                height: 58,
                backgroundColor: '#320e4f',
                borderRadius: 16,

                borderTopWidth: 0,
                //adding a bit of shadow to the bar to make it look like its atucally flaoting
                shadowColor: '#000',
                shadowOpacity: 0.3,
            },
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: '#A0AEC0',
            //moving the icons in the tab bar a bit down
            tabBarItemStyle: {
                padding: 6,
            },
        }}>
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