import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  ActionRow,
  ProfileScaffold,
  ProfileScrollView,
  ProfileSectionBlock,
} from "@/components/profile/ProfileScaffold";

export default function HelpCenter() {
  return (
    <ProfileScaffold
      title="Help Center"
      subtitle="Support, questions, and issue reporting."
    >
      {(contentWidth) => (
        <ProfileScrollView contentWidth={contentWidth}>
          <ProfileSectionBlock title="Support">
            <ActionRow
              icon="chatbubble-ellipses-outline"
              label="Contact support"
              iconTint="#BAE6FD"
              onPress={() => router.push("/profile/help-center/contact")}
            />
            <View style={styles.divider} />
            <ActionRow
              icon="help-circle-outline"
              label="FAQs"
              iconTint="#C7D2FE"
              onPress={() => router.push("/profile/help-center/faq")}
            />
            <View style={styles.divider} />
            <ActionRow
              icon="bug-outline"
              label="Report a bug"
              iconTint="#F4E7CF"
              onPress={() => router.push("/profile/help-center/report_bug")}
            />
          </ProfileSectionBlock>
        </ProfileScrollView>
      )}
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 72,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});
