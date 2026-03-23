import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditGuideProfile() {
    const [bio, setBio] = useState("");
    const [city, setCity] = useState("");
    const [languages, setLanguages] = useState("");
    const [specialty, setSpecialty] = useState("");

    return (
        <LinearGradient
            colors={["#0F172A", "#020617", "#000000"]}
            style={{ flex: 1 }}
        >
            <SafeAreaView className="flex-1">
                <ScrollView className="px-6">

                    <Text className="text-white text-2xl font-bold mt-4">
                        Edit Guide Profile
                    </Text>

                    {/* BIO */}
                    <Text className="text-white/70 mt-6">Bio</Text>
                    <TextInput
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Tell tourists about yourself..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        className="bg-white/10 text-white p-4 rounded-xl mt-2"
                    />

                    {/* CITY */}
                    <Text className="text-white/70 mt-6">City</Text>
                    <TextInput
                        value={city}
                        onChangeText={setCity}
                        placeholder="Chicago"
                        placeholderTextColor="#9CA3AF"
                        className="bg-white/10 text-white p-4 rounded-xl mt-2"
                    />

                    {/* LANGUAGES */}
                    <Text className="text-white/70 mt-6">Languages</Text>
                    <TextInput
                        value={languages}
                        onChangeText={setLanguages}
                        placeholder="English, Spanish"
                        placeholderTextColor="#9CA3AF"
                        className="bg-white/10 text-white p-4 rounded-xl mt-2"
                    />

                    {/* SPECIALTY */}
                    <Text className="text-white/70 mt-6">Tour Specialty</Text>
                    <TextInput
                        value={specialty}
                        onChangeText={setSpecialty}
                        placeholder="Food tours, hidden gems..."
                        placeholderTextColor="#9CA3AF"
                        className="bg-white/10 text-white p-4 rounded-xl mt-2"
                    />

                    {/* SAVE BUTTON */}
                    <Pressable className="bg-indigo-600 mt-8 p-4 rounded-xl items-center">
                        <Text className="text-white font-semibold text-lg">
                            Save Profile
                        </Text>
                    </Pressable>

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}