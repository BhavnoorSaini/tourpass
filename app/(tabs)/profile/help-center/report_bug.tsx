import { Alert, StyleSheet, View } from "react-native";
import { useState } from "react";
import {
  ProfileActionButton,
  ProfileInputField,
  ProfileScaffold,
  ProfileScrollView,
  ProfileSectionBlock,
} from "@/components/profile/ProfileScaffold";

export default function ReportBugScreen() {
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    Alert.alert("Bug report", "Bug reporting can be connected here.");
    setDetails("");
  };

  return (
    <ProfileScaffold
      title="Report a Bug"
      subtitle="Share the issue so we can reproduce and fix it."
    >
      {(contentWidth) => (
        <ProfileScrollView contentWidth={contentWidth}>
          <ProfileSectionBlock title="Details">
            <View style={styles.form}>
              <ProfileInputField
                label="What happened?"
                placeholder="Describe the bug, steps, and what you expected."
                value={details}
                onChangeText={setDetails}
                multiline
              />
            </View>
          </ProfileSectionBlock>

          <ProfileActionButton
            label="Submit report"
            icon="bug-outline"
            onPress={handleSubmit}
            style={styles.button}
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
  },
  button: {
    marginTop: 22,
    alignSelf: "flex-start",
  },
});
