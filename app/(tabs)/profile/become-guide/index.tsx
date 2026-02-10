import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function GuideIntro() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-[#0B1D3A] px-6">
            {/* Back button */}
            <Pressable
                onPress={() => router.back()}
                className="mt-14 w-12 h-12 justify-center"
            >
                <Ionicons name="close" size={28} color="white" />
            </Pressable>

            {/* Header */}
            <View className="mt-10 mb-10">
                <Text className="text-white text-4xl font-bold leading-tight">
                    Turn your local{"\n"}knowledge into{"\n"}income
                </Text>

                <Text className="text-white/70 text-base mt-4">
                    Join our community of expert local guides.
                </Text>
            </View>

            {/* Features List */}
            <View className="gap-8">
                <View className="flex-row gap-4">
                    <View className="w-12 h-12 rounded-xl bg-blue-500/20 items-center justify-center">
                        <Ionicons name="calendar-outline" size={24} color="#60A5FA" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">Earn on your schedule</Text>
                        <Text className="text-white/70 mt-1">You choose when and how often you host tours.</Text>
                    </View>
                </View>

                <View className="flex-row gap-4">
                    <View className="w-12 h-12 rounded-xl bg-emerald-500/20 items-center justify-center">
                        <Ionicons name="map-outline" size={24} color="#34D399" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">Share local secrets</Text>
                        <Text className="text-white/70 mt-1">Show travelers hidden gems only locals know.</Text>
                    </View>
                </View>

                <View className="flex-row gap-4">
                    <View className="w-12 h-12 rounded-xl bg-orange-500/20 items-center justify-center">
                        <Ionicons name="cash-outline" size={24} color="#FB923C" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">Fast payouts</Text>
                        <Text className="text-white/70 mt-1">Get paid quickly after every completed tour.</Text>
                    </View>
                </View>
            </View>

            {/* CTA */}
            <View className="mt-auto mb-10">
                <Pressable
                    onPress={() => router.push("/profile/become-guide/setup")}
                    className="bg-blue-500 py-4 rounded-2xl items-center"
                >
                    <Text className="text-white text-lg font-semibold">
                        Start Application →
                    </Text>
                </Pressable>
                <Text className="text-white/50 text-center mt-3 text-sm">
                    Takes less than 5 minutes to get started
                </Text>
            </View>
        </View>
    );
}