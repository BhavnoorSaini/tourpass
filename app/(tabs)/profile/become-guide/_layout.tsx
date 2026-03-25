import { Stack } from "expo-router";

export default function GuideLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#030712" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="setup_completed" />
    </Stack>
  );
}
