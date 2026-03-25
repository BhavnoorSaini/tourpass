import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  ActionRow,
  ProfileActionButton,
  ProfileMetric,
  ProfileScaffold,
  ProfileScrollView,
  ProfileSectionBlock,
} from "@/components/profile/ProfileScaffold";

export default function GuideDashboard() {
  const router = useRouter();

  const handlePlaceholder = (label: string) => {
    Alert.alert(label, "This guide workflow can be connected when your dashboard data is ready.");
  };

  return (
    <ProfileScaffold
      title="Guide Dashboard"
      subtitle="Tours, requests, and earnings at a glance."
    >
      {(contentWidth) => (
        <ProfileScrollView contentWidth={contentWidth}>
          <View style={styles.metricRow}>
            <ProfileMetric value="$0" label="Earnings" />
            <ProfileMetric value="0" label="Completed" />
            <ProfileMetric value="0" label="Requests" />
          </View>

          <ProfileSectionBlock title="Requests" style={styles.section}>
            <View style={styles.panelBody}>
              <Text style={styles.lead}>No pending requests</Text>
              <Text style={styles.note}>New booking requests will appear here.</Text>
            </View>
          </ProfileSectionBlock>

          <ProfileSectionBlock title="Manage" style={styles.section}>
            <ActionRow
              icon="create-outline"
              label="Edit guide profile"
              iconTint="#BAE6FD"
              onPress={() => router.push("/profile/guide-profile")}
            />
            <View style={styles.divider} />
            <ActionRow
              icon="map-outline"
              label="Create new route"
              iconTint="#F4E7CF"
              onPress={() => handlePlaceholder("Create new route")}
            />
          </ProfileSectionBlock>

          <View style={styles.ctaRow}>
            <ProfileActionButton
              label="Create route"
              icon="add-outline"
              onPress={() => handlePlaceholder("Create new route")}
              style={styles.flexButton}
            />
            <ProfileActionButton
              label="Guide profile"
              icon="person-circle-outline"
              onPress={() => router.push("/profile/guide-profile")}
              variant="secondary"
              style={styles.flexButton}
            />
          </View>
        </ProfileScrollView>
      )}
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  section: {
    marginTop: 22,
  },
  panelBody: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 6,
  },
  lead: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
  },
  note: {
    color: "#9AAABC",
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 72,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  ctaRow: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
});
