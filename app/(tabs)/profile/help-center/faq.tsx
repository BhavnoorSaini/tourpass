import { ScrollView, View, Text, Pressable } from "react-native";
import { useState } from "react";
import {LinearGradient} from "expo-linear-gradient";

const FAQS = [
    {
        question: "How do I reset my password?",
        answer: "Go to Profile > Settings > Change Password and follow the steps.",
    },
    {
        question: "How do I contact support?",
        answer: "You can reach support through the Contact Support page in the Help Center.",
    },
    {
        question: "Why is my app not loading?",
        answer: "Make sure you’re connected to the internet and using the latest version of the app.",
    },
];

export default function FAQScreen() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <LinearGradient
            colors={['#0F172A', '#020617', '#000000']}
            style={{ flex: 1 }}
        >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            {FAQS.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                    <View
                        key={index}
                        style={{
                            backgroundColor: "#1C2A44",
                            borderRadius: 14,
                            padding: 16,
                            marginBottom: 12,
                        }}
                    >
                        <Pressable onPress={() => setOpenIndex(isOpen ? null : index)}>
                            <Text
                                style={{
                                    color: "#fff",
                                    fontSize: 16,
                                    fontWeight: "600",
                                }}
                            >
                                {item.question}
                            </Text>
                        </Pressable>

                        {isOpen && (
                            <Text
                                style={{
                                    color: "#C7D2FE",
                                    marginTop: 10,
                                    lineHeight: 20,
                                }}
                            >
                                {item.answer}
                            </Text>
                        )}
                    </View>
                );
            })}
        </ScrollView>
        </LinearGradient>
    );
}