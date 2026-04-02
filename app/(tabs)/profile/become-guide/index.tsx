import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { radius, spacing } from "@/constants/spacing";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableButton } from "@/components/ui/PressableButton";

export default function GuideIntro() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const Feature = ({ icon, title, sub, color }: { icon: any, title: string, sub: string, color: string }) => (
        <View style={styles.feature}>
            <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[typography.headingS, { color: theme.text }]}>{title}</Text>
                <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 2 }]}>{sub}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
            <Pressable
                onPress={() => router.back()}
                style={[styles.closeBtn, { backgroundColor: theme.surface }]}
            >
                <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[typography.displayM, { color: theme.text }]}>
                        Host your local knowledge
                    </Text>
                    <Text style={[typography.bodyM, { color: theme.textSecondary, marginTop: spacing.sm }]}>
                        Join our community of expert local guides and earn on your own terms.
                    </Text>
                </View>

                <View style={styles.features}>
                    <Feature 
                        icon="calendar-outline" 
                        title="Your schedule" 
                        sub="Choose exactly when and how often you host." 
                        color="#60A5FA" 
                    />
                    <Feature 
                        icon="map-outline" 
                        title="Local secrets" 
                        sub="Share the hidden gems only locals know about." 
                        color="#34D399" 
                    />
                    <Feature 
                        icon="cash-outline" 
                        title="Fast payouts" 
                        sub="Get paid automatically after every completed tour." 
                        color="#FB923C" 
                    />
                </View>

                <View style={styles.footer}>
                    <PressableButton 
                        label="Start Application" 
                        onPress={() => router.push("/profile/become-guide/setup")} 
                    />
                    <Text style={[typography.bodyS, { color: theme.textTertiary, textAlign: 'center', marginTop: spacing.md }]}>
                        Application takes less than 5 minutes
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    closeBtn: {
        position: 'absolute',
        top: spacing.lg,
        left: spacing.lg,
        width: 36,
        height: 36,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    scroll: {
        paddingHorizontal: spacing.xl,
        paddingTop: 80,
        paddingBottom: spacing.xxl,
    },
    header: {
        marginBottom: spacing.xxl,
    },
    features: {
        gap: spacing.xl,
    },
    feature: {
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        marginTop: 64,
    }
});
