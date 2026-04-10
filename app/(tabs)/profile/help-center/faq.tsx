import React, { memo, useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HelpScreenLayout, HelpSection } from '@/components/help/HelpScreenLayout';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

const FAQS = [
  {
    question: 'How do I reset my password?',
    answer: 'Go to Profile, open Settings, then choose Change Password and follow the prompts.',
  },
  {
    question: 'How do I contact support?',
    answer: 'Open the Help Center and use the Contact Support form to send your message.',
  },
  {
    question: 'Why is my app not loading?',
    answer: 'Check your internet connection, restart the app, and make sure you are using the latest version.',
  },
];

const FAQItem = memo(function FAQItem({
  question,
  answer,
  isOpen,
  isLast,
  onPress,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  isLast: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.item,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.background,
        },
      ]}
    >
      <View style={styles.itemHeader}>
        <Text style={[typography.headingS, styles.question, { color: theme.text }]}>
          {question}
        </Text>
        <Ionicons
          name={isOpen ? 'remove' : 'add'}
          size={18}
          color={isOpen ? theme.text : theme.textSecondary}
        />
      </View>

      {isOpen ? (
        <Text style={[typography.bodyS, styles.answer, { color: theme.textSecondary }]}>
          {answer}
        </Text>
      ) : null}
    </Pressable>
  );
});

export default function FAQScreen() {
  const theme = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  }, []);

  return (
    <HelpScreenLayout
      title="FAQ"
      eyebrow="Help Center"
      description="Quick answers to the questions guides and travelers ask most often."
      footer={
        <Text style={[typography.bodyS, styles.footerText, { color: theme.textSecondary }]}>
          Need more help? Contact support and we&apos;ll get back to you within 24 hours.
        </Text>
      }
    >
      <HelpSection label="Popular Questions">
        <Card innerStyle={styles.cardInner}>
          {FAQS.map((item, index) => (
            <FAQItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              isLast={index === FAQS.length - 1}
              onPress={() => handleToggle(index)}
            />
          ))}
        </Card>
      </HelpSection>
    </HelpScreenLayout>
  );
}

const styles = StyleSheet.create({
  cardInner: {
    paddingHorizontal: 0,
    paddingVertical: spacing.xs,
  },
  item: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  question: {
    flex: 1,
  },
  answer: {
    marginTop: spacing.sm,
    paddingRight: spacing.xl,
  },
  footerText: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
