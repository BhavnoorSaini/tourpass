import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ProfileActionButton,
  ProfileScaffold,
  ProfileScrollView,
} from "@/components/profile/ProfileScaffold";
import { GlassPanel } from "@/components/profile/ProfilePrimitives";

export default function SetupCompleted() {
  return (
    <ProfileScaffold
      title="Submitted"
      subtitle="Your guide application is in review."
      onBackPress={() => router.dismissTo("/profile")}
      backIcon="close"
    >
      {(contentWidth) => (
        <ProfileScrollView contentWidth={contentWidth}>
          <GlassPanel
            style={styles.panel}
            contentStyle={styles.panelContent}
            intensity={28}
            gradientColors={[
              "rgba(171, 196, 255, 0.14)",
              "rgba(255, 255, 255, 0.03)",
            ]}
          >
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={28} color="#091220" />
            </View>
            <Text style={styles.title}>Application received</Text>
            <Text style={styles.note}>
              Reviews usually take 24 to 48 hours. We&apos;ll notify you when your
              account is ready.
            </Text>
          </GlassPanel>

          <ProfileActionButton
            label="Back to profile"
            icon="home-outline"
            onPress={() => router.dismissTo("/profile")}
            style={styles.button}
          />
        </ProfileScrollView>
      )}
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 30,
  },
  panelContent: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 30,
    gap: 14,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 231, 207, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  title: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  note: {
    color: "#9AAABC",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 380,
  },
  button: {
    marginTop: 22,
    alignSelf: "center",
  },
});
