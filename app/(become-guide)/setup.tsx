import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const onUploadPress = () => {
    // TODO: backend hookup
};

export default function GuideSetup() {
    return (
        <View className="flex-1 bg-[#0B1D3A] px-6">
            {/* Back button */}
            <Pressable
                onPress={() => router.back()}
                className="absolute top-14 left-6 z-10"
            >
                <Ionicons name="chevron-back" size={28} color="white" />
            </Pressable>

            {/* Header */}
            <View className="mt-28 mb-8">
                <Text className="text-white text-3xl font-bold">
                    Guide Profile Setup
                </Text>
                <Text className="text-white/70 mt-2">
                    Help travelers get to know you better.
                </Text>
            </View>

            {/* Form */}
            <View className="gap-6">
                {/* Primary City */}
                <View>
                    <Text className="text-white/80 mb-2">Primary City</Text>
                    <View className="bg-white/10 border border-white/20 rounded-2xl flex-row items-center px-4 py-4">
                        <Ionicons name="location-outline" size={20} color="#94A3B8" />
                        <TextInput
                            placeholder="e.g. Paris, France"
                            placeholderTextColor="#94A3B8"
                            className="ml-3 text-white flex-1"
                        />
                    </View>
                </View>

                {/* Languages */}
                <View>
                    <Text className="text-white/80 mb-2">Languages Spoken</Text>
                    <View className="bg-white/10 border border-white/20 rounded-2xl flex-row items-center px-4 py-4">
                        <Ionicons name="globe-outline" size={20} color="#94A3B8" />
                        <TextInput
                            placeholder="English, French, Spanish..."
                            placeholderTextColor="#94A3B8"
                            className="ml-3 text-white flex-1"
                        />
                    </View>
                </View>

                {/* Bio */}
                <View>
                    <Text className="text-white/80 mb-2">Bio & Expertise</Text>
                    <View className="bg-white/10 border border-white/20 rounded-2xl px-4 py-4">
                        <TextInput
                            multiline
                            numberOfLines={4}
                            placeholder="Share your story, local hidden gems you know, and your area of expertise (history, food, photography...)"
                            placeholderTextColor="#94A3B8"
                            className="text-white"
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Identification */}
                <View>
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-white/80">Identification Documents</Text>
                        <Ionicons name="checkmark-circle" size={18} color="#2DD4BF" />
                    </View>
                    <Pressable onPress={onUploadPress} className="bg-white/10 border border-white/20 rounded-2xl items-center justify-center py-10">
                        <View className="w-14 h-14 rounded-full bg-blue-500/20 items-center justify-center mb-3">
                            <Ionicons name="cloud-upload-outline" size={28} color="#60A5FA" />
                        </View>

                        <Text className="text-white font-semibold">
                            Upload ID or Passport
                        </Text>
                        <Text className="text-white/60 text-sm mt-1 text-center px-6">
                            Required for identity verification and safety
                        </Text>
                    </Pressable>
                </View>

                {/* Info box */}
                <View className="bg-blue-500/10 border border-blue-400/20 rounded-2xl px-4 py-3 flex-row gap-3">
                    <Ionicons name="information-circle-outline" size={20} color="#60A5FA" />
                    <Text className="text-blue-200 text-sm flex-1">
                        Your documents are processed securely and never shared with travelers.
                        We typically verify guides within 24–48 hours.
                    </Text>
                </View>
            </View>



            {/* Continue Button */}
            <View className="mt-auto mb-8">
                <Pressable
                    onPress={() => {
                         router.push("/setup_completed")
                    }}
                    className="bg-blue-500 py-4 rounded-2xl items-center"
                >
                    <Text className="text-white text-lg font-semibold">
                        Continue →
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

