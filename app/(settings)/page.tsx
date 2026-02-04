import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


export default function Settings() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-[#0B1D3A]">
            {/* Back button */}
            <Pressable
                onPress={() => router.back()}
                className="absolute top-14 left-6 z-10"
            >
                <Ionicons name="arrow-back" size={26} color="white" />
            </Pressable>

            {/* Page content */}
            <View className="mt-24 px-6">
                <Text className="text-white text-2xl font-semibold">
                    Settings
                </Text>
            </View>
        </View>
    );

}
