import React, { useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HelpScreenLayout, HelpSection } from '@/components/help/HelpScreenLayout';
import { Card } from '@/components/ui/Card';
import { PressableButton } from '@/components/ui/PressableButton';
import { StyledTextInput } from '@/components/ui/StyledTextInput';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

export default function ContactSupportScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isDisabled = useMemo(() => submitting || message.trim().length < 10, [message, submitting]);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to contact support.');
      return;
    }

    const trimmedMessage = message.trim();
    setSubmitting(true);
    const { error } = await supabase.from('help_center_submissions').insert({
      user_id: user.id,
      type: 'support',
      message: trimmedMessage,
      metadata: {
        source: 'contact_support',
      },
    });
    setSubmitting(false);

    if (error) {
      Alert.alert('Could Not Send', error.message);
      return;
    }

    Alert.alert('Message sent', 'Our support team will review your note and follow up soon.');
    setMessage('');
  };

  return (
    <HelpScreenLayout
      title="Contact Support"
      eyebrow="Help Center"
      description="Share what you need help with and our team will follow up with the next steps."
      footer={
        <Text style={[typography.bodyS, styles.footerText, { color: theme.textSecondary }]}>
          Include booking details, screenshots, or route names so we can help faster.
        </Text>
      }
    >
      <HelpSection label="Message">
        <Card>
          <StyledTextInput
            label="How can we help?"
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue, what you expected, and what happened instead."
            placeholderTextColor={theme.textTertiary}
            multiline
            inputStyle={styles.multilineInput}
          />

          <View style={styles.actionBlock}>
            <PressableButton
              label="Send Message"
              onPress={handleSubmit}
              disabled={isDisabled}
              loading={submitting}
            />
          </View>
        </Card>
      </HelpSection>
    </HelpScreenLayout>
  );
}

const styles = StyleSheet.create({
  multilineInput: {
    lineHeight: 22,
  },
  actionBlock: {
    marginTop: spacing.md,
  },
  footerText: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
