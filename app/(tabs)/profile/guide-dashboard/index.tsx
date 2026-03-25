import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function GuideDashboard() {
    const router = useRouter();

    return (
        <ScrollView className="flex-1 bg-black p-6">
            {/* Section 1: Stats */}
            <View className="bg-blue-900 rounded-2xl p-6 mb-6">
                <Text className="text-white text-2xl font-bold mb-4">
                    Earnings Overview
                </Text>

                <View className="flex-row justify-between">
                    <View>
                        <Text className="text-white text-xl font-bold">$0</Text>
                        <Text className="text-white/60">Total Earnings</Text>
                    </View>

                    <View>
                        <Text className="text-white text-xl font-bold">0</Text>
                        <Text className="text-white/60">Completed Tours</Text>
                    </View>

                    <View>
                        <Text className="text-white text-xl font-bold">0</Text>
                        <Text className="text-white/60">Active Requests</Text>
                    </View>
                </View>
            </View>

            {/* Section 2: Pending Requests */}
            <View className="bg-neutral-900 rounded-2xl p-6 mb-6">
                <Text className="text-white text-xl font-semibold mb-4">
                    Pending Requests
                </Text>

                <Text className="text-white/60">
                    No pending tour requests yet.
                </Text>
            </View>

            {/* Section 3: Create Route */}
            <TouchableOpacity
                //onPress={() => router.push("/profile/create-route")}
                className="bg-blue-800 rounded-2xl p-5 items-center"
            >
                <Text className="text-white text-lg font-semibold">
                    Create New Route
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}