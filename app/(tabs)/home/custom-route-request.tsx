import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { StyledTextInput } from '@/components/ui/StyledTextInput';
import { PressableButton } from '@/components/ui/PressableButton';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { border, useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';

type PickerMode = 'date' | 'time' | null;

function addHours(date: Date, hours: number) {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
}

export default function CustomRouteRequestScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [places, setPlaces] = useState('');
  const [notes, setNotes] = useState('');
  const [requestDate, setRequestDate] = useState<Date | null>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [draftDate, setDraftDate] = useState<Date>(() => addHours(new Date(), 2));
  const [submitting, setSubmitting] = useState(false);

  const minDate = useMemo(() => new Date(), []);

  const openPicker = (mode: Exclude<PickerMode, null>) => {
    setDraftDate(requestDate ?? addHours(new Date(), 2));
    setPickerMode(mode);
  };

  const closePicker = () => setPickerMode(null);

  const handlePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    // Android: "set" commits, "dismissed" cancels. Either way the modal auto-closes.
    if (Platform.OS === 'android') {
      setPickerMode(null);
      if (event.type === 'set' && selected) {
        setRequestDate((prev) => {
          if (pickerMode === 'date') {
            const base = prev ?? selected;
            const next = new Date(selected);
            next.setHours(base.getHours(), base.getMinutes(), 0, 0);
            return next;
          }
          const base = prev ?? new Date();
          const next = new Date(base);
          next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
          return next;
        });
      }
      return;
    }
    // iOS inline picker fires on every spin — track into draftDate.
    if (selected) setDraftDate(selected);
  };

  const confirmIosPicker = () => {
    setRequestDate((prev) => {
      if (pickerMode === 'date') {
        const base = prev ?? draftDate;
        const next = new Date(draftDate);
        next.setHours(base.getHours(), base.getMinutes(), 0, 0);
        return next;
      }
      const base = prev ?? draftDate;
      const next = new Date(base);
      next.setHours(draftDate.getHours(), draftDate.getMinutes(), 0, 0);
      return next;
    });
    setPickerMode(null);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to request a custom tour.');
      return;
    }
    if (!places.trim()) {
      Alert.alert('Places Required', 'List at least one place you would like to visit.');
      return;
    }
    if (!requestDate) {
      Alert.alert('Date Required', 'Choose a date and time for your tour.');
      return;
    }
    if (requestDate.getTime() < Date.now()) {
      Alert.alert('Invalid Date', 'Please choose a date in the future.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('custom_routes').insert({
      tourist_id: user.id,
      places: places.trim(),
      notes: notes.trim() || null,
      request_date: requestDate.toISOString(),
    });
    setSubmitting(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert(
      'Request Sent',
      'Your custom tour request is visible to guides. The first guide to accept will be matched with you.',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  const dateLabel = requestDate
    ? requestDate.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Select date';

  const timeLabel = requestDate
    ? requestDate.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Select time';

  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ScreenHeader title="Request Custom Tour" onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.introCard}>
            <Text style={[typography.labelS, { color: theme.accent }]}>Your Journey</Text>
            <Text style={[typography.headingM, styles.cardTitle, { color: theme.text }]}>
              Tell us what you&apos;d like to see.
            </Text>
            <Text style={[typography.bodyS, styles.cardText, { color: theme.textSecondary }]}>
              Share a list of places, any notes, and the date. Guides can accept your request on a
              first-come first-served basis.
            </Text>
          </Card>

          <View style={styles.form}>
            <StyledTextInput
              label="Places you'd like to visit"
              value={places}
              onChangeText={setPlaces}
              placeholder="e.g. Millennium Park, Navy Pier, Art Institute"
              placeholderTextColor={theme.textTertiary}
              multiline
            />
            <StyledTextInput
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Interests, accessibility needs, language preferences..."
              placeholderTextColor={theme.textTertiary}
              multiline
            />

            <View style={styles.dateTimeGroup}>
              <Text
                style={[
                  typography.labelS,
                  styles.dateTimeLabel,
                  { color: theme.textSecondary },
                ]}
              >
                Date &amp; time
              </Text>
              <View style={styles.dateTimeRow}>
                <Pressable
                  onPress={() => openPicker('date')}
                  style={[
                    styles.dateTimeField,
                    {
                      backgroundColor: theme.surface,
                      borderColor: border(theme, pickerMode === 'date'),
                    },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={theme.textSecondary}
                    style={styles.fieldIcon}
                  />
                  <Text
                    style={[
                      typography.bodyM,
                      { color: requestDate ? theme.text : theme.textTertiary },
                    ]}
                    numberOfLines={1}
                  >
                    {dateLabel}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => openPicker('time')}
                  style={[
                    styles.dateTimeField,
                    {
                      backgroundColor: theme.surface,
                      borderColor: border(theme, pickerMode === 'time'),
                    },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={theme.textSecondary}
                    style={styles.fieldIcon}
                  />
                  <Text
                    style={[
                      typography.bodyM,
                      { color: requestDate ? theme.text : theme.textTertiary },
                    ]}
                    numberOfLines={1}
                  >
                    {timeLabel}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <PressableButton
            label="Send Request"
            icon="send"
            loading={submitting}
            disabled={submitting}
            onPress={handleSubmit}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* iOS inline picker inside a modal sheet */}
      {Platform.OS === 'ios' && pickerMode !== null && (
        <Modal transparent animationType="fade" onRequestClose={closePicker}>
          <Pressable style={styles.modalBackdrop} onPress={closePicker}>
            <Pressable
              style={[styles.modalSheet, { backgroundColor: theme.surface }]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Pressable onPress={closePicker} hitSlop={12}>
                  <Text style={[typography.buttonM, { color: theme.textSecondary }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Text style={[typography.labelS, { color: theme.text }]}>
                  {pickerMode === 'date' ? 'Pick a date' : 'Pick a time'}
                </Text>
                <Pressable onPress={confirmIosPicker} hitSlop={12}>
                  <Text style={[typography.buttonM, { color: theme.accent }]}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={draftDate}
                mode={pickerMode}
                display="spinner"
                minimumDate={pickerMode === 'date' ? minDate : undefined}
                onChange={handlePickerChange}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Android fires a native dialog directly */}
      {Platform.OS === 'android' && pickerMode !== null && (
        <DateTimePicker
          value={draftDate}
          mode={pickerMode}
          display="default"
          minimumDate={pickerMode === 'date' ? minDate : undefined}
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  introCard: {
    marginTop: spacing.lg,
  },
  cardTitle: {
    marginTop: spacing.xs,
  },
  cardText: {
    marginTop: spacing.sm,
  },
  form: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  dateTimeGroup: {
    marginTop: spacing.xs,
  },
  dateTimeLabel: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateTimeField: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  fieldIcon: {
    marginRight: spacing.sm,
  },
  submit: {
    marginTop: spacing.xl,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
