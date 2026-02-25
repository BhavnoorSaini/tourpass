import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase"; //getting into connecting backend with frontend

const onUploadPress = () => {
    // TODO: backend hookup
};
//LOGIC FOR SUBMITTING THE APPLICATION
const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from("profiles")
        .update({
            application_status: "pending",
        })
        .eq("id", user?.id);

    if (error) {
        console.log("Error submitting:", error);
        return;
    }

    // WE WILL ONLY go to success page after backend works
    router.push("/profile/become-guide/setup_completed");
};
//cool

export default function GuideSetup() {
    return (
        <View className="flex-1 bg-[#0B1D3A] px-6">
            <Pressable
                onPress={() => router.back()}
                className="absolute top-14 left-6 z-10"
            >
                <Ionicons name="chevron-back" size={28} color="white" />
            </Pressable>

            <View className="mt-28 mb-8">
                <Text className="text-white text-3xl font-bold">Guide Profile Setup</Text>
                <Text className="text-white/70 mt-2">Help travelers get to know you better.</Text>
            </View>

            <View className="gap-6">
                {/* Form Fields */}
                <View>
                    <Text className="text-white/80 mb-2">Primary City</Text>
                    <View className="bg-white/10 border border-white/20 rounded-2xl flex-row items-center px-4 py-4">
                        <Ionicons name="location-outline" size={20} color="#94A3B8" />
                        <TextInput placeholder="e.g. Paris, France" placeholderTextColor="#94A3B8" className="ml-3 text-white flex-1" />
                    </View>
                </View>

                <View>
                    <Text className="text-white/80 mb-2">Languages Spoken</Text>
                    <View className="bg-white/10 border border-white/20 rounded-2xl flex-row items-center px-4 py-4">
                        <Ionicons name="globe-outline" size={20} color="#94A3B8" />
                        <TextInput placeholder="English, French, Spanish..." placeholderTextColor="#94A3B8" className="ml-3 text-white flex-1" />
                    </View>
                </View>

                <View>
                    <Text className="text-white/80 mb-2">Bio & Expertise</Text>
                    <View className="bg-white/10 border border-white/20 rounded-2xl px-4 py-4">
                        <TextInput multiline numberOfLines={4} placeholder="Share your story..." placeholderTextColor="#94A3B8" className="text-white" textAlignVertical="top" />
                    </View>
                </View>

                <View>
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-white/80">Identification Documents</Text>
                        <Ionicons name="checkmark-circle" size={18} color="#2DD4BF" />
                    </View>
                    <Pressable onPress={onUploadPress} className="bg-white/10 border border-white/20 rounded-2xl items-center justify-center py-10">
                        <View className="w-14 h-14 rounded-full bg-blue-500/20 items-center justify-center mb-3">
                            <Ionicons name="cloud-upload-outline" size={28} color="#60A5FA" />
                        </View>
                        <Text className="text-white font-semibold">Upload ID or Passport</Text>
                    </Pressable>
                </View>
            </View>

            <View className="mt-auto mb-8">
                <Pressable
                    onPress={handleSubmit} //replaced router.push("/profile/become-guide/setup_completed")
                    className="bg-blue-500 py-4 rounded-2xl items-center"
                >
                    <Text className="text-white text-lg font-semibold">Submit →</Text>
                </Pressable>
            </View>
        </View>
    );
}