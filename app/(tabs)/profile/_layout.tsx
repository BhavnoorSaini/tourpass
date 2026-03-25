import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#030712" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="become-guide" options={{ presentation: "modal" }} />
      <Stack.Screen name="guide-dashboard/index" />
      <Stack.Screen name="guide-profile/index" />
      <Stack.Screen name="help-center" />
      <Stack.Screen name="payments/index" />
      <Stack.Screen name="preferences/index" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
