import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { darkTheme, lightTheme } from '@/constants/theme';

// Tab icon names mapped to Ionicons
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  home: { active: 'compass', inactive: 'compass-outline' },
  'explore-routes/index': { active: 'map', inactive: 'map-outline' },
  'message/index': { active: 'chatbubble', inactive: 'chatbubble-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

export default function TabsLayout() {
  const { user, initializing } = useAuth();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  if (initializing) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={({ route }) => {
        const icons = TAB_ICONS[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: theme.tabBarBackground,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 56,
            paddingBottom: 0,
          },
          tabBarActiveTintColor: theme.tabActive,
          tabBarInactiveTintColor: theme.tabInactive,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={22}
              color={color}
            />
          ),
        };
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore-routes/index" options={{ title: 'Explore' }} />
      <Tabs.Screen name="message/index" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
