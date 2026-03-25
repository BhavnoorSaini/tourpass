import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {LinearGradient} from "expo-linear-gradient";

export default function HelpCenter() {
    return (
        <LinearGradient
            colors={['#0F172A', '#020617', '#000000']}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >


            <Text className="text-white text-3xl font-bold mt-6 mb-6">
                Help Center
            </Text>

            {/* FAQ */}
            <Pressable
                onPress={() => router.push("/profile/help-center/faq")}
                className="bg-white/10 p-4 rounded-2xl mb-4 flex-row justify-between items-center"
            >
                <Text className="text-white text-lg">FAQs</Text>
                <Ionicons name="chevron-forward" size={20} color="white" />
            </Pressable>

            {/* Contact */}
            <Pressable
                onPress={() => router.push("/profile/help-center/contact")}
                className="bg-white/10 p-4 rounded-2xl mb-4 flex-row justify-between items-center"
            >
                <Text className="text-white text-lg">Contact Support</Text>
                <Ionicons name="chevron-forward" size={20} color="white" />
            </Pressable>

            {/* Report Bug */}
            <Pressable
                onPress={() => router.push("/profile/help-center/report_bug")}
                className="bg-white/10 p-4 rounded-2xl mb-4 flex-row justify-between items-center"
            >
                <Text className="text-white text-lg">Report a Bug</Text>
                <Ionicons name="chevron-forward" size={20} color="white" />
            </Pressable>

        </ScrollView>
        </LinearGradient>
    );
}