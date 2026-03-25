import React, { useMemo } from "react";
import { Redirect, Tabs } from "expo-router";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/providers/AuthProvider";

export default function TabsLayout() {
  const { user, initializing } = useAuth();
  const { width } = useWindowDimensions();
  const tabBarWidth = useMemo(() => Math.min(width - 52, 340), [width]);
  const tabBarStyle = useMemo(
    () => [styles.tabBar, { width: tabBarWidth, alignSelf: "center" as const }],
    [tabBarWidth]
  );

  if (initializing) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#F4E7CF",
        tabBarInactiveTintColor: "#7E90A7",
        sceneStyle: { backgroundColor: "transparent" },
        tabBarStyle,
        tabBarItemStyle: styles.tabBarItem,
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              intensity={32}
              tint="dark"
              experimentalBlurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.tabBarOverlay} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 26 : 24} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="message"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={focused ? 26 : 24}
              name="newspaper.fill"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
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

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 20,
    height: 64,
    borderTopWidth: 0,
    backgroundColor: "transparent",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#020617",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  tabBarOverlay: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "rgba(8, 14, 25, 0.46)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  tabBarItem: {
    paddingTop: 7,
    paddingBottom: 7,
  },
});
