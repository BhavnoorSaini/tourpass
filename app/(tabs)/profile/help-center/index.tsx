import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { radius, spacing } from "@/constants/spacing";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function HelpRow({ label, onPress, isLast = false }: { label: string; onPress: () => void; isLast?: boolean }) {
  const theme = useTheme();
  const [pressed, setPressed] = React.useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.row,
        {
          backgroundColor: pressed ? theme.surfaceRaised : 'transparent',
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.background,
        },
      ]}
    >
      <Text style={[typography.bodyM, { color: theme.text, flex: 1 }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} />
    </Pressable>
  );
}

import React from 'react';

export default function HelpCenter() {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
            <ScreenHeader title="Help Center" onBack={() => router.back()} />

            <ScrollView
                contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={[typography.labelS, styles.sectionLabel, { color: theme.textSecondary }]}>
                        Support
                    </Text>
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <HelpRow label="FAQs" onPress={() => router.push("/profile/help-center/faq")} />
                        <HelpRow label="Contact Support" onPress={() => router.push("/profile/help-center/contact")} />
                        <HelpRow label="Report a Bug" onPress={() => router.push("/profile/help-center/report_bug")} isLast />
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Text style={[typography.bodyS, { color: theme.textSecondary, textAlign: 'center' }]}>
                        Our team typically responds within 24 hours.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    section: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    sectionLabel: {
        marginLeft: spacing.sm,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
    },
    card: {
        borderRadius: radius.lg,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 16,
    },
    infoBox: {
        marginTop: spacing.xxl,
        paddingHorizontal: spacing.xl,
    }
});
