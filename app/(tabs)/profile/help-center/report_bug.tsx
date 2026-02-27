import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import {LinearGradient} from "expo-linear-gradient";

export default function ReportBugScreen() {
    const [details, setDetails] = useState("");

    return (
        <LinearGradient
            colors={['#0F172A', '#020617', '#000000']}
            style={{ flex: 1 }}
        >
        <View style={{ padding: 20 }}>
            <Text
                style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "600",
                    marginBottom: 12,
                }}
            >
                Report a Bug
            </Text>

            <Text
                style={{
                    color: "#94A3B8",
                    marginBottom: 8,
                }}
            >
                Tell us what went wrong so we can fix it.
            </Text>

            <TextInput
                placeholder="What happened?"
                placeholderTextColor="#94A3B8"
                value={details}
                onChangeText={setDetails}
                multiline
                style={{
                    backgroundColor: "#1C2A44",
                    color: "#fff",
                    borderRadius: 14,
                    padding: 16,
                    minHeight: 160,
                    textAlignVertical: "top",
                }}
            />

            <Pressable
                style={{
                    backgroundColor: "#DC2626",
                    borderRadius: 14,
                    padding: 16,
                    marginTop: 16,
                    alignItems: "center",
                }}
                onPress={() => {
                    // later: gotta submit bug
                    setDetails("");
                }}
            >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Submit Bug Report
                </Text>
            </Pressable>
        </View>
        </LinearGradient>
    );
}