import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { GlassPanel } from "@/components/profile/ProfilePrimitives";
import {
  ActionRow,
  ProfileScaffold,
  ProfileScrollView,
  ProfileSectionBlock,
} from "@/components/profile/ProfileScaffold";

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function getUserProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (isMounted) {
          setUserEmail(user?.email || "Guest");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void getUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRoute = useCallback(
    (href: "/profile/settings/edit-profile" | "/profile/settings/password") => {
      router.push(href);
    },
    [router]
  );

  const handlePlaceholder = useCallback((label: string) => {
    Alert.alert(label, "This setting can be connected when the backend flow is ready.");
  }, []);

  const deleteProfile = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No active user found.");
      }

      const { error } = await supabase.from("profiles").delete().eq("id", user.id);

      if (error) {
        throw error;
      }

      await supabase.auth.signOut();
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Unable to delete",
        error instanceof Error ? error.message : "Please try again."
      );
      setLoading(false);
    }
  }, [router]);

  const handleDeleteProfile = useCallback(() => {
    Alert.alert(
      "Delete profile",
      "This will permanently delete your profile data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteProfile();
          },
        },
      ]
    );
  }, [deleteProfile]);

  return (
    <ProfileScaffold
      title="Settings"
      subtitle="Account, privacy, and app defaults."
    >
      {(contentWidth) => (
        <ProfileScrollView contentWidth={contentWidth}>
          {loading ? (
            <GlassPanel
              style={styles.loadingPanel}
              contentStyle={styles.loadingContent}
              intensity={20}
              gradientColors={[
                "rgba(255, 255, 255, 0.08)",
                "rgba(255, 255, 255, 0.02)",
              ]}
            >
              <ActivityIndicator color="#F4E7CF" />
            </GlassPanel>
          ) : (
            <>
              <ProfileSectionBlock title="Account">
                <ActionRow
                  icon="person-circle-outline"
                  label="Edit profile"
                  iconTint="#BAE6FD"
                  onPress={() => handleRoute("/profile/settings/edit-profile")}
                />
                <View style={styles.divider} />
                <ActionRow
                  icon="lock-closed-outline"
                  label="Change password"
                  iconTint="#C7D2FE"
                  onPress={() => handleRoute("/profile/settings/password")}
                />
              </ProfileSectionBlock>

              <ProfileSectionBlock title="Privacy" style={styles.section}>
                <ActionRow
                  icon="location-outline"
                  label="Location sharing"
                  badge="Always"
                  iconTint="#A7F3D0"
                  onPress={() => handlePlaceholder("Location sharing")}
                />
                <View style={styles.divider} />
                <ActionRow
                  icon="shield-checkmark-outline"
                  label="Data privacy"
                  iconTint="#A7F3D0"
                  onPress={() => handlePlaceholder("Data privacy")}
                />
              </ProfileSectionBlock>

              <ProfileSectionBlock title="Notifications" style={styles.section}>
                <ActionRow
                  icon="notifications-outline"
                  label="Push notifications"
                  iconTint="#F4E7CF"
                  onPress={() => handlePlaceholder("Push notifications")}
                />
                <View style={styles.divider} />
                <ActionRow
                  icon="mail-outline"
                  label="Email preferences"
                  iconTint="#F4E7CF"
                  onPress={() => handlePlaceholder("Email preferences")}
                />
              </ProfileSectionBlock>

              <ProfileSectionBlock title="About" style={styles.section}>
                <ActionRow
                  icon="information-circle-outline"
                  label="Version"
                  badge="2.4.0"
                  iconTint="#D9E0EA"
                  onPress={() => handlePlaceholder("Version")}
                />
                <View style={styles.divider} />
                <ActionRow
                  icon="document-text-outline"
                  label="Terms of service"
                  iconTint="#D9E0EA"
                  onPress={() => handlePlaceholder("Terms of service")}
                />
              </ProfileSectionBlock>

              <ProfileSectionBlock title="Danger Zone" style={styles.section}>
                <ActionRow
                  icon="trash-outline"
                  label="Delete profile"
                  iconTint="#FCA5A5"
                  destructive
                  onPress={handleDeleteProfile}
                />
              </ProfileSectionBlock>

              <Text style={styles.footerText}>Signed in as {userEmail}</Text>
            </>
          )}
        </ProfileScrollView>
      )}
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  loadingPanel: {
    borderRadius: 26,
  },
  loadingContent: {
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginTop: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 72,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  footerText: {
    marginTop: 22,
    color: "#74859A",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
});
