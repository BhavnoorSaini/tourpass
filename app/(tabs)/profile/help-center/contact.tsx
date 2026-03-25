import { Alert, StyleSheet, View } from "react-native";
import { useState } from "react";
import {
  ProfileActionButton,
  ProfileInputField,
  ProfileScaffold,
  ProfileScrollView,
  ProfileSectionBlock,
} from "@/components/profile/ProfileScaffold";

export default function ContactSupportScreen() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    Alert.alert("Support", "Support submission can be connected here.");
    setMessage("");
  };

  return (
    <ProfileScaffold
      title="Contact Support"
      subtitle="Send a message and we’ll follow up."
    >
      {(contentWidth) => (
        <ProfileScrollView contentWidth={contentWidth}>
          <ProfileSectionBlock title="Message">
            <View style={styles.form}>
              <ProfileInputField
                label="Describe the issue"
                placeholder="Tell us what you need help with."
                value={message}
                onChangeText={setMessage}
                multiline
              />
            </View>
          </ProfileSectionBlock>

          <ProfileActionButton
            label="Send message"
            icon="send-outline"
            onPress={handleSend}
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
