import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import {LinearGradient} from "expo-linear-gradient";

export default function ContactSupportScreen() {
    const [message, setMessage] = useState("");

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
                Contact Support
            </Text>

            <TextInput
                placeholder="Describe your issue..."
                placeholderTextColor="#94A3B8"
                value={message}
                onChangeText={setMessage}
                multiline
                style={{
                    backgroundColor: "#1C2A44",
                    color: "#fff",
                    borderRadius: 14,
                    padding: 16,
                    minHeight: 140,
                    textAlignVertical: "top",
                }}
            />

            <Pressable
                style={{
                    backgroundColor: "#2563EB",
                    borderRadius: 14,
                    padding: 16,
                    marginTop: 16,
                    alignItems: "center",
                }}
                onPress={() => {
                    // later: gotta send to backend
                    setMessage("");
                }}
            >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Send Message
                </Text>
            </Pressable>
        </View>
        </LinearGradient>
    );
}