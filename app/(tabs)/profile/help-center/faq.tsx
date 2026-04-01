import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSurface } from '@/components/ui/AppSurface';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

const faqs = [
  {
    question: 'How do I reset my password?',
    answer: 'Go to Profile, open Settings, then choose Change Password.',
  },
  {
    question: 'How do I contact support?',
    answer: 'Use the Contact Support screen inside the Help Center.',
  },
  {
    question: 'Why is the app not loading correctly?',
    answer: 'Check your network connection and make sure the app is fully up to date.',
  },
] as const;

export default function FAQScreen() {
  const styles = useThemedStyles(createStyles);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppHeader
        backVisible
        eyebrow="FAQs"
        title="Short answers for the questions that repeat most."
      />

      <View style={styles.stack}>
        {faqs.map((item, index) => {
          const open = openIndex === index;

          return (
            <Pressable
              key={item.question}
              accessibilityRole="button"
              onPress={() => setOpenIndex(open ? null : index)}
            >
              <AppSurface style={styles.faqCard}>
                <View style={styles.faqTop}>
                  <AppText variant="title">{item.question}</AppText>
                  <AppText variant="mono">{open ? 'Close' : 'Open'}</AppText>
                </View>
                {open ? <AppText variant="body">{item.answer}</AppText> : null}
                <AccentLine active={open} />
              </AppSurface>
            </Pressable>
          );
        })}
      </View>
    </AppScreen>
  );
}

const createStyles = (_theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    screen: {
      paddingTop: 16,
    },
    stack: {
      gap: 16,
    },
    faqCard: {
      padding: 16,
      gap: 12,
    },
    faqTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
    },
  });
