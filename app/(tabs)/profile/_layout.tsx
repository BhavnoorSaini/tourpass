import { Stack } from "expo-router";

export default function ProfileLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="become-guide" options={{ headerShown: false, presentation: 'modal' }} />
			<Stack.Screen name="help-center/index" options={{ title: 'Help Center' }} />
			<Stack.Screen name="payments/index" options={{ title: 'Guide Billing' }} />
			<Stack.Screen name="preferences/index" options={{ title: 'Preferences' }} />
			<Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
		</Stack>
	);
}
