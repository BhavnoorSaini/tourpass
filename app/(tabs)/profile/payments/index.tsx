import { Alert, StyleSheet, Text, View } from "react-native";
import {
  ActionRow,
  ProfileActionButton,
  ProfileMetric,
  ProfileScaffold,
  ProfileScrollView,
  ProfileSectionBlock,
} from "@/components/profile/ProfileScaffold";

export default function PaymentsScreen() {
  const handlePlaceholder = (label: string) => {
    Alert.alert(label, "This payment workflow can be connected when the backend is ready.");
  };

  return (
    <ProfileScaffold
      title="Payments"
      subtitle="Payout setup and transaction status."
    >
      {(contentWidth) => (
        <ProfileScrollView contentWidth={contentWidth}>
          <View style={styles.metricRow}>
            <ProfileMetric value="$0" label="Balance" />
            <ProfileMetric value="0" label="Payouts" />
          </View>

          <ProfileSectionBlock title="Payouts" style={styles.section}>
            <View style={styles.sectionContent}>
              <Text style={styles.lead}>No payout method connected</Text>
              <Text style={styles.note}>
                Add a bank account or card when payouts are enabled.
              </Text>
              <ProfileActionButton
                label="Add payout method"
                icon="card-outline"
                onPress={() => handlePlaceholder("Add payout method")}
                style={styles.fullButton}
              />
            </View>
          </ProfileSectionBlock>

          <ProfileSectionBlock title="Payment details" style={styles.section}>
            <ActionRow
              icon="receipt-outline"
              label="Transaction history"
              iconTint="#C7D2FE"
              onPress={() => handlePlaceholder("Transaction history")}
            />
            <View style={styles.divider} />
            <ActionRow
              icon="shield-checkmark-outline"
              label="Tax details"
              iconTint="#BAE6FD"
              onPress={() => handlePlaceholder("Tax details")}
            />
          </ProfileSectionBlock>
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
  sectionContent: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
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
  fullButton: {
    alignSelf: "flex-start",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 72,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});
