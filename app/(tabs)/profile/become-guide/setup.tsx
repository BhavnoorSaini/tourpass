import { Alert, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import {
  ProfileActionButton,
  ProfileInputField,
  ProfileScaffold,
  ProfileScrollView,
  ProfileSectionBlock,
} from "@/components/profile/ProfileScaffold";

export default function GuideSetup() {
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onUploadPress = () => {
    Alert.alert("Documents", "Document upload can be connected here.");
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("profiles")
        .update({
          application_status: "pending",
        })
        .eq("id", user?.id);

      if (error) {
        throw error;
      }

      router.push("/profile/become-guide/setup_completed");
    } catch (error) {
      Alert.alert(
        "Unable to submit",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProfileScaffold
      title="Guide Setup"
      subtitle="Share the essentials guests need before they book."
    >
      {(contentWidth) => (
        <ProfileScrollView contentWidth={contentWidth}>
          <ProfileSectionBlock title="Profile">
            <View style={styles.form}>
              <ProfileInputField
                label="Primary city"
                icon="location-outline"
                placeholder="Chicago"
                value={city}
                onChangeText={setCity}
              />
              <ProfileInputField
                label="Languages"
                icon="globe-outline"
                placeholder="English, Spanish"
                value={languages}
                onChangeText={setLanguages}
              />
              <ProfileInputField
                label="Bio"
                placeholder="What guests should know about you and your expertise."
                value={bio}
                onChangeText={setBio}
                multiline
              />
            </View>
          </ProfileSectionBlock>

          <ProfileSectionBlock title="Verification" style={styles.section}>
            <View style={styles.uploadBody}>
              <View style={styles.uploadHeader}>
                <View style={styles.uploadIconWrap}>
                  <Ionicons name="cloud-upload-outline" size={24} color="#F4E7CF" />
                </View>
                <View style={styles.uploadText}>
                  <Text style={styles.uploadTitle}>Identification documents</Text>
                  <Text style={styles.uploadNote}>Upload your ID or passport.</Text>
                </View>
              </View>
              <ProfileActionButton
                label="Upload documents"
                icon="document-attach-outline"
                onPress={onUploadPress}
                variant="secondary"
                style={styles.uploadButton}
              />
            </View>
          </ProfileSectionBlock>

          <ProfileActionButton
            label={submitting ? "Submitting..." : "Submit application"}
            icon="arrow-forward"
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        </ProfileScrollView>
      )}
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16,
  },
  section: {
    marginTop: 22,
  },
  uploadBody: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16,
  },
  uploadHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  uploadIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 231, 207, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(244, 231, 207, 0.18)",
  },
  uploadText: {
    flex: 1,
    gap: 4,
  },
  uploadTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
  },
  uploadNote: {
    color: "#8FA1B8",
    fontSize: 13,
    lineHeight: 18,
  },
  uploadButton: {
    alignSelf: "flex-start",
  },
  submitButton: {
    marginTop: 22,
    alignSelf: "flex-start",
  },
});
