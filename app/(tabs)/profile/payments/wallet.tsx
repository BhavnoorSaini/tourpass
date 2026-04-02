import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PlanId } from '@/components/paywall/PaywallScreen';

function formatPlanLabel(plan?: string | string[]) {
  const value = Array.isArray(plan) ? plan[0] : plan;

  if (value === 'monthly') {
    return 'Monthly · $4.99/month';
  }

  return 'Annual · $39.99/year';
}

export default function WalletScreen() {
  const { plan } = useLocalSearchParams<{ plan?: PlanId }>();
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const selectedPlanLabel = useMemo(() => formatPlanLabel(plan), [plan]);

  const handleConfirmMembership = () => {
    if (!cardholderName || !cardNumber || !expiryDate || !cvv) {
      Alert.alert('Missing information', 'Please fill out all card fields before continuing.');
      return;
    }

    console.log('Membership request accepted for plan:', plan ?? 'annual');
    console.log('Card details captured for:', cardholderName);

    Alert.alert(
      'Membership request received',
      `Your ${selectedPlanLabel} membership request has been submitted.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <LinearGradient colors={['#07161D', '#0B2430', '#102F3D']} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIcon}>
                  <Ionicons name="card-outline" size={22} color="#06252F" />
                </View>
                <Text style={styles.summaryEyebrow}>Confirm Subscription</Text>
              </View>

              <Text style={styles.summaryTitle}>Add your payment details</Text>
              <Text style={styles.summaryText}>
                Review your selected membership and enter card information before
                Tourpass accepts your premium request.
              </Text>

              <View style={styles.planPill}>
                <Text style={styles.planPillText}>{selectedPlanLabel}</Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Wallet</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cardholder name</Text>
                <TextInput
                  autoCapitalize="words"
                  onChangeText={setCardholderName}
                  placeholder="Jordan Smith"
                  placeholderTextColor="rgba(230, 244, 241, 0.38)"
                  style={styles.input}
                  value={cardholderName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card number</Text>
                <TextInput
                  keyboardType="number-pad"
                  maxLength={19}
                  onChangeText={setCardNumber}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="rgba(230, 244, 241, 0.38)"
                  style={styles.input}
                  value={cardNumber}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Expiry</Text>
                  <TextInput
                    autoCapitalize="characters"
                    maxLength={5}
                    onChangeText={setExpiryDate}
                    placeholder="MM/YY"
                    placeholderTextColor="rgba(230, 244, 241, 0.38)"
                    style={styles.input}
                    value={expiryDate}
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    keyboardType="number-pad"
                    maxLength={4}
                    onChangeText={setCvv}
                    placeholder="123"
                    placeholderTextColor="rgba(230, 244, 241, 0.38)"
                    style={styles.input}
                    value={cvv}
                  />
                </View>
              </View>

              <Pressable onPress={handleConfirmMembership} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Confirm membership</Text>
              </Pressable>

              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back to plans</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 18,
    padding: 22,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: '#6EE7C8',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  summaryEyebrow: {
    color: '#9EDFD3',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    color: '#F6FFFC',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 10,
  },
  summaryText: {
    color: 'rgba(230, 244, 241, 0.75)',
    fontSize: 15,
    lineHeight: 22,
  },
  planPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(110,231,200,0.12)',
    borderColor: '#6EE7C8',
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  planPillText: {
    color: '#D9FFF5',
    fontSize: 13,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
  },
  sectionTitle: {
    color: '#F6FFFC',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#D9FFF5',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    borderWidth: 1,
    color: '#F6FFFC',
    fontSize: 15,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  row: {
    columnGap: 12,
    flexDirection: 'row',
  },
  halfWidth: {
    flex: 1,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: '#6EE7C8',
    borderRadius: 18,
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 56,
  },
  confirmButtonText: {
    color: '#04232C',
    fontSize: 16,
    fontWeight: '800',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 44,
  },
  backButtonText: {
    color: 'rgba(230, 244, 241, 0.75)',
    fontSize: 14,
    fontWeight: '600',
  },
});
