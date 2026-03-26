import { useState } from "react";
import { View, Text, Pressable, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";

export default function GuideSetup() {
    const [primaryCity, setPrimaryCity] = useState('');
    const [languagesSpoken, setLanguagesSpoken] = useState('');
    const [bio, setBio] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Alert.alert('Not Signed In', 'You must be signed in to apply.');
            return;
        }

        setSubmitting(true);

        const languagesArray = languagesSpoken
            .split(',')
            .map((l) => l.trim())
            .filter(Boolean);

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                primary_city: primaryCity.trim() || null,
                languages_spoken: languagesArray.length > 0 ? languagesArray : null,
                bio: bio.trim() || null,
            })
            .eq('id', user.id);

        if (profileError) {
            setSubmitting(false);
            Alert.alert('Submission Failed', profileError.message);
            return;
        }

        const { error: statusError } = await supabase
            .rpc('submit_guide_application');

        if (statusError) {
            setSubmitting(false);
            Alert.alert('Submission Failed', statusError.message);
            return;
        }

        setSubmitting(false);
        router.push('/profile/become-guide/setup_completed');
    };

    return (
        <LinearGradient
            colors={['#0F172A', '#020617', '#000000']}
            style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}
        >
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
                <View>
                    <Text className="text-white/80 mb-2">Primary City</Text>
                    <View className="bg-white/10 border border-white/20 rounded-2xl flex-row items-center px-4 py-4">
                        <Ionicons name="location-outline" size={20} color="#94A3B8" />
                        <TextInput
                            value={primaryCity}
                            onChangeText={setPrimaryCity}
                            placeholder="e.g. Paris, France"
                            placeholderTextColor="#94A3B8"
                            className="ml-3 text-white flex-1"
                        />
                    </View>
                </View>

                <View>
                    <Text className="text-white/80 mb-2">Languages Spoken</Text>
                    <View className="bg-white/10 border border-white/20 rounded-2xl flex-row items-center px-4 py-4">
                        <Ionicons name="globe-outline" size={20} color="#94A3B8" />
                        <TextInput
                            value={languagesSpoken}
                            onChangeText={setLanguagesSpoken}
                            placeholder="English, French, Spanish..."
                            placeholderTextColor="#94A3B8"
                            className="ml-3 text-white flex-1"
                        />
                    </View>
                </View>

                <View>
                    <Text className="text-white/80 mb-2">Bio & Expertise</Text>
                    <View className="bg-white/10 border border-white/20 rounded-2xl px-4 py-4">
                        <TextInput
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                            placeholder="Share your story..."
                            placeholderTextColor="#94A3B8"
                            className="text-white"
                            textAlignVertical="top"
                        />
                    </View>
                </View>
            </View>

            <View className="mt-auto mb-8">
                <Pressable
                    onPress={handleSubmit}
                    disabled={submitting}
                    className="bg-blue-500 py-4 rounded-2xl items-center"
                    style={{ opacity: submitting ? 0.6 : 1 }}
                >
                    <Text className="text-white text-lg font-semibold">
                        {submitting ? 'Submitting...' : 'Submit →'}
                    </Text>
                </Pressable>
            </View>
        </LinearGradient>
    );
}