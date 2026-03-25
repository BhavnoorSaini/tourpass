import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ProfileActionButton,
  ProfileScaffold,
  ProfileScrollView,
  ProfileSectionBlock,
} from "@/components/profile/ProfileScaffold";
import { GlassPanel } from "@/components/profile/ProfilePrimitives";

const FEATURES = [
  {
    icon: "calendar-outline" as const,
    tint: "#BAE6FD",
    title: "Flexible schedule",
    description: "Host when it fits your week.",
  },
  {
    icon: "map-outline" as const,
    tint: "#C7D2FE",
    title: "Local expertise",
    description: "Share the places you know best.",
  },
  {
    icon: "cash-outline" as const,
    tint: "#F4E7CF",
    title: "Fast payouts",
    description: "Track earnings from every tour.",
  },
] as const;

export default function GuideIntro() {
  const router = useRouter();

  return (
    <ProfileScaffold
      title="Become a Guide"
      subtitle="Set up a polished guide profile and start hosting."
      onBackPress={() => router.back()}
      backIcon="close"
    >
      {(contentWidth) => (
        <ProfileScrollView contentWidth={contentWidth}>
          <GlassPanel
            style={styles.heroPanel}
            contentStyle={styles.heroContent}
            intensity={30}
            gradientColors={[
              "rgba(171, 196, 255, 0.14)",
              "rgba(255, 255, 255, 0.03)",
            ]}
          >
            <Text style={styles.heroTitle}>Turn local knowledge into a polished guest experience.</Text>
            <Text style={styles.heroSubtitle}>
              Applications are quick and your dashboard will handle the rest.
            </Text>
          </GlassPanel>

          <ProfileSectionBlock title="Why join" style={styles.section}>
            <View style={styles.featureStack}>
              {FEATURES.map((feature, index) => (
                <View key={feature.title}>
                  <View style={styles.featureRow}>
                    <View style={[styles.featureIcon, { backgroundColor: `${feature.tint}18` }]}>
                      <Ionicons name={feature.icon} size={20} color={feature.tint} />
                    </View>
                    <View style={styles.featureText}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </View>
                  {index < FEATURES.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </View>
          </ProfileSectionBlock>

          <ProfileActionButton
            label="Start application"
            icon="arrow-forward"
            onPress={() => router.push("/profile/become-guide/setup")}
            style={styles.cta}
          />
        </ProfileScrollView>
      )}
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  heroPanel: {
    borderRadius: 30,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 10,
  },
  heroTitle: {
    color: "#F8FAFC",
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 34,
  },
  heroSubtitle: {
    color: "#9AAABC",
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginTop: 22,
  },
  featureStack: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  featureRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "700",
  },
  featureDescription: {
    color: "#8FA1B8",
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  cta: {
    marginTop: 22,
    alignSelf: "flex-start",
  },
});
