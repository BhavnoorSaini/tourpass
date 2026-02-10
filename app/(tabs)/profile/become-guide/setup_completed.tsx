import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SetupCompleted() {
    return (
        <View className="flex-1 bg-[#0B1D3A] px-6">
            <View className="flex-1 items-center justify-center">
                <View className="relative mb-10">
                    <View className="w-48 h-36 bg-white/10 rounded-2xl rotate-[-8deg] items-center justify-center">
                        <View className="flex-row gap-6">
                            <View className="w-10 h-10 rounded-full bg-orange-400/80 items-center justify-center">
                                <Ionicons name="location-outline" size={20} color="white" />
                            </View>
                            <View className="w-10 h-10 rounded-full bg-teal-400/80 items-center justify-center">
                                <Ionicons name="navigate-outline" size={20} color="white" />
                            </View>
                        </View>
                    </View>
                    <View className="absolute -top-6 -right-6 w-14 h-14 rounded-full bg-blue-500 items-center justify-center border-4 border-[#0B1D3A]">
                        <Ionicons name="checkmark" size={28} color="white" />
                    </View>
                </View>

                <Text className="text-white text-3xl font-bold text-center mb-4">
                    Application Submitted!
                </Text>
                <Text className="text-white/70 text-center text-base leading-6 px-4">
                    Our team is currently reviewing your profile and route.
                    This usually takes 24–48 hours.
                </Text>
            </View>

            <View className="mb-10">
                {/* Routes back to the main Profile screen */}
                <Pressable
                    onPress={() => router.dismissTo('/profile')}
                    className="bg-blue-500 py-4 rounded-2xl items-center"
                >
                    <Text className="text-white text-lg font-semibold">
                        Take me home
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}