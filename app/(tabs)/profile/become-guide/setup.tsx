import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { radius, spacing } from "@/constants/spacing";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { StyledTextInput } from "@/components/ui/StyledTextInput";

export default function GuideSetup() {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    const [primaryCity, setPrimaryCity] = useState('');
    const [languagesSpoken, setLanguagesSpoken] = useState('');
    const [bio, setBio] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setSubmitting(true);
        const langs = languagesSpoken.split(',').map(l => l.trim()).filter(Boolean);

        const { error } = await supabase.from('profiles').update({
            primary_city: primaryCity.trim() || null,
            languages_spoken: langs.length > 0 ? langs : null,
            bio: bio.trim() || null,
        }).eq('id', user.id);

        if (error) {
            setSubmitting(false);
            return;
        }

        await supabase.rpc('submit_guide_application');
        setSubmitting(false);
        router.push('/profile/become-guide/setup_completed');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
            <ScreenHeader 
                title="Profile Setup" 
                onBack={() => router.back()} 
                right={
                    <Pressable onPress={handleSubmit} disabled={submitting}>
                        {submitting ? <ActivityIndicator size="small" color={theme.accent} /> : (
                            <Text style={[typography.buttonM, { color: theme.accent }]}>Submit</Text>
                        )}
                    </Pressable>
                }
            />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.intro}>
                    <Text style={[typography.bodyM, { color: theme.textSecondary }]}>
                        Help travelers get to know you better.
                    </Text>
                </View>

                <View style={styles.form}>
                    <StyledTextInput 
                        label="Primary City" 
                        value={primaryCity} 
                        onChangeText={setPrimaryCity} 
                        placeholder="e.g. Paris, France" 
                    />
                    <StyledTextInput 
                        label="Languages" 
                        value={languagesSpoken} 
                        onChangeText={setLanguagesSpoken} 
                        placeholder="English, Spanish..." 
                    />
                    <StyledTextInput 
                        label="Bio & Expertise" 
                        value={bio} 
                        onChangeText={setBio} 
                        multiline 
                        placeholder="Share your story..." 
                        inputStyle={{ minHeight: 100, paddingTop: spacing.xs }}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    intro: {
        marginTop: spacing.md,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.xs,
    },
    form: {
        gap: spacing.md,
    }
});
