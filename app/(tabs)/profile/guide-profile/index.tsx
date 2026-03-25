import { Alert, StyleSheet, View } from "react-native";
import { useState } from "react";
import {
  ProfileActionButton,
  ProfileInputField,
  ProfileScaffold,
  ProfileScrollView,
  ProfileSectionBlock,
} from "@/components/profile/ProfileScaffold";

export default function EditGuideProfile() {
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState("");
  const [specialty, setSpecialty] = useState("");

  const handleSave = () => {
    Alert.alert("Guide profile", "Guide profile saving can be connected here.");
  };

  return (
    <ProfileScaffold
      title="Guide Profile"
      subtitle="Public details guests will see before they book."
    >
      {(contentWidth) => (
        <ProfileScrollView contentWidth={contentWidth}>
          <ProfileSectionBlock title="Details">
            <View style={styles.form}>
              <ProfileInputField
                label="Bio"
                placeholder="Tell travelers what makes your tours memorable."
                value={bio}
                onChangeText={setBio}
                multiline
              />
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
                label="Specialty"
                icon="sparkles-outline"
                placeholder="Food tours, architecture, hidden gems"
                value={specialty}
                onChangeText={setSpecialty}
              />
            </View>
          </ProfileSectionBlock>

          <ProfileActionButton
            label="Save profile"
            icon="checkmark-outline"
            onPress={handleSave}
            style={styles.saveButton}
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
  saveButton: {
    marginTop: 22,
    alignSelf: "flex-start",
  },
});
