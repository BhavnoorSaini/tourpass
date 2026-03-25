import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ProfileScaffold } from "@/components/profile/ProfileScaffold";
import { GlassPanel } from "@/components/profile/ProfilePrimitives";

const FAQS = [
  {
    question: "How do I reset my password?",
    answer: "Go to Profile, open Settings, then choose Change Password.",
  },
  {
    question: "How do I contact support?",
    answer: "Open Help Center and choose Contact Support to send us a message.",
  },
  {
    question: "Why is the app not loading?",
    answer: "Check your internet connection and make sure you are on the latest version.",
  },
] as const;

export default function FAQScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <ProfileScaffold
      title="FAQs"
      subtitle="Quick answers for the most common questions."
    >
      {(contentWidth) => (
        <FlatList
          data={FAQS}
          keyExtractor={(item) => item.question}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, { width: contentWidth }]}
          renderItem={({ item, index }) => {
            const isOpen = openIndex === index;

            return (
              <GlassPanel
                style={styles.itemPanel}
                contentStyle={styles.itemContent}
                intensity={20}
                gradientColors={[
                  "rgba(255, 255, 255, 0.08)",
                  "rgba(255, 255, 255, 0.02)",
                ]}
              >
                <Pressable
                  onPress={() => setOpenIndex(isOpen ? null : index)}
                  style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
                >
                  <Text style={styles.question}>{item.question}</Text>
                  <Ionicons
                    name={isOpen ? "remove-outline" : "add-outline"}
                    size={20}
                    color="#F8FAFC"
                  />
                </Pressable>
                {isOpen ? <Text style={styles.answer}>{item.answer}</Text> : null}
              </GlassPanel>
            );
          }}
        />
      )}
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 136,
    gap: 12,
  },
  itemPanel: {
    borderRadius: 24,
  },
  itemContent: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 10,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  triggerPressed: {
    opacity: 0.92,
  },
  question: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  answer: {
    color: "#9AAABC",
    fontSize: 14,
    lineHeight: 20,
  },
});
