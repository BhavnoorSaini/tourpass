import { Stack } from "expo-router";

export default function HelpCenterLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, //to hide the default header
            }}
        >
            <Stack.Screen
                name="index"
                options={{ title: "Help Center" }}
            />
            <Stack.Screen
                name="faq"
                options={{ title: "FAQs" }}
            />
            <Stack.Screen
                name="contact"
                options={{ title: "Contact Support" }}
            />
            <Stack.Screen
                name="report_bug"
                options={{ title: "Report a Bug" }}
            />
        </Stack>
    );
}