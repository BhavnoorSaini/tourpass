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
                        Become a TourPass guide
                    </Text>
                    <Text style={[typography.bodyM, { color: theme.textSecondary, marginTop: spacing.sm }]}>
                        Apply for a monthly Guide Seat to create routes, accept requests, and get paid by users.
                    </Text>
                </View>

                <View style={styles.features}>
                    <Feature 
                        icon="person-circle-outline"
                        title="Be listed as a guide"
                        sub="Keep an active guide profile travelers can discover."
                        color="#60A5FA" 
                    />
                    <Feature 
                        icon="map-outline" 
                        title="Create routes"
                        sub="Publish walking routes and manage requests from the guide dashboard."
                        color="#34D399" 
                    />
                    <Feature 
                        icon="cash-outline" 
                        title="Get paid by users"
                        sub="Earn from users who book your routes or request custom tours."
                        color="#FB923C" 
                    />
                </View>

                <View style={[styles.seatCard, { backgroundColor: theme.surface }]}>
                    <Text style={[typography.labelS, { color: theme.accent }]}>Guide Seat</Text>
                    <Text style={[typography.headingM, { color: theme.text, marginTop: spacing.xs }]}>
                        $29.99 / month
                    </Text>
                    <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: spacing.sm }]}>
                        Approved guides need an active Guide Seat to stay listed, create routes, and receive paid requests.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <PressableButton 
                        label="Start Application"
                        onPress={() => router.push("/profile/become-guide/setup")} 
                    />
                    <Text style={[typography.bodyS, { color: theme.textTertiary, textAlign: 'center', marginTop: spacing.md }]}>
                        Application takes less than 5 minutes. Subscription starts after approval.
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
    seatCard: {
        marginTop: spacing.xxl,
        borderRadius: radius.lg,
        padding: spacing.lg,
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
        marginTop: spacing.xxl,
    }
});
