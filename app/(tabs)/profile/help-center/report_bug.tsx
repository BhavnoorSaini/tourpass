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

export default function ReportBugScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isDisabled = useMemo(() => submitting || details.trim().length < 10, [details, submitting]);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to report a bug.');
      return;
    }

    const trimmedDetails = details.trim();
    setSubmitting(true);
    const { error } = await supabase.from('help_center_submissions').insert({
      user_id: user.id,
      type: 'bug',
      message: trimmedDetails,
      metadata: {
        source: 'report_bug',
      },
    });
    setSubmitting(false);

    if (error) {
      Alert.alert('Could Not Submit', error.message);
      return;
    }

    Alert.alert('Bug report sent', 'Thanks for the report. We will review it and investigate.');
    setDetails('');
  };

  return (
    <HelpScreenLayout
      title="Report a Bug"
      eyebrow="Help Center"
      description="Tell us what went wrong so we can reproduce the issue and ship a fix."
      footer={
        <Text style={[typography.bodyS, styles.footerText, { color: theme.textSecondary }]}>
          Mention your device, the screen you were on, and the steps that caused the problem.
        </Text>
      }
    >
      <HelpSection label="Issue Details">
        <Card>
          <StyledTextInput
            label="What happened?"
            value={details}
            onChangeText={setDetails}
            placeholder="Describe the bug and the steps that led up to it."
            placeholderTextColor={theme.textTertiary}
            multiline
            inputStyle={styles.multilineInput}
          />

          <View style={styles.actionBlock}>
            <PressableButton
              label="Submit Bug Report"
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
