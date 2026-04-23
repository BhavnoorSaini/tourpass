import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { PressableButton } from '@/components/ui/PressableButton';
import { StyledTextInput } from '@/components/ui/StyledTextInput';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { border, useTheme } from '@/constants/theme';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault?: boolean;
};

interface GuideProfile {
  is_guide: boolean | null;
}

const GUIDE_BILLING_RATE = '$29.99 / month';

const GUIDE_BILLING_FEATURES = [
  'Be listed as a TourPass guide',
  'Create and publish routes',
  'Get paid by users',
];

const INITIAL_CARDS: SavedCard[] = [
  {
    id: '1',
    brand: 'Visa',
    last4: '4242',
    expiry: '08/28',
    isDefault: true,
  },
];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function formatCardNumber(value: string) {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
  return digitsOnly.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
  if (digitsOnly.length < 3) return digitsOnly;
  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
}

function PaymentMethodButton({
  card,
  selected,
  onPress,
}: {
  card: SavedCard;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const cardStyle = {
    ...styles.cardButton,
    borderWidth: 1,
    borderColor: selected ? theme.accent : border(theme),
  };

  return (
    <Card onPress={onPress} style={cardStyle}>
      <View style={styles.cardRow}>
        <View style={styles.cardMeta}>
          <View style={styles.cardTopRow}>
            <Ionicons name="card-outline" size={18} color={theme.text} />
            <Text style={[typography.headingS, { color: theme.text, marginLeft: spacing.sm }]}>
              {card.brand} ending in {card.last4}
            </Text>
          </View>
          <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 4 }]}>
            Expires {card.expiry}
          </Text>
        </View>

        <View style={styles.cardRight}>
          {card.isDefault ? (
            <View style={[styles.defaultBadge, { backgroundColor: `${theme.accent}18` }]}>
              <Text style={[typography.labelS, { color: theme.accent }]}>Default</Text>
            </View>
          ) : null}
          <Ionicons
            name={selected ? 'radio-button-on' : 'radio-button-off'}
            size={18}
            color={selected ? theme.accent : theme.textSecondary}
          />
        </View>
      </View>
    </Card>
  );
}

export default function GuideBillingScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [profile, setProfile] = useState<GuideProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [selectedCardId, setSelectedCardId] = useState(INITIAL_CARDS[0]?.id ?? '');
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];
  const isAddCardValid =
    cardNumber.trim().length >= 19 && expiry.trim().length === 5 && cvv.trim().length >= 3;

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('is_guide')
      .eq('id', user.id)
      .single();

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setProfile(data);
    }

    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  const toggleAddCard = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsAddCardOpen((current) => !current);
  };

  const handleSaveCard = () => {
    if (!isAddCardValid) {
      Alert.alert('Missing information', 'Please complete all card fields before saving.');
      return;
    }

    const digitsOnly = cardNumber.replace(/\D/g, '');
    const last4 = digitsOnly.slice(-4) || '0000';
    const nextId = Date.now().toString();

    setCards((current) => [
      {
        id: nextId,
        brand: 'Card',
        last4,
        expiry,
      },
      ...current,
    ]);
    setSelectedCardId(nextId);
    setCardNumber('');
    setExpiry('');
    setCvv('');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsAddCardOpen(false);
  };

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.text} />
      </View>
    );
  }

  if (!profile?.is_guide) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.labelM, { color: theme.textSecondary }]}>Guide Billing</Text>
              <Text style={[typography.headingM, { color: theme.text, marginTop: spacing.xs }]}>
                Guide access required
              </Text>
            </View>
            <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={12}>
              <Ionicons name="arrow-back" size={20} color={theme.text} />
            </Pressable>
          </View>

          <Card>
            <Text style={[typography.headingS, { color: theme.text }]}>
              This page is for approved guides.
            </Text>
            <Text style={[typography.bodyS, styles.cardCopy, { color: theme.textSecondary }]}>
              Apply to become a guide before managing billing details.
            </Text>
            <PressableButton
              label="Apply to Become a Guide"
              onPress={() => router.replace('/profile/become-guide')}
              style={styles.fullWidthButton}
            />
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.labelM, { color: theme.textSecondary }]}>Guide Billing</Text>
            <Text style={[typography.headingM, { color: theme.text, marginTop: spacing.xs }]}>
              Manage your billing details
            </Text>
          </View>

          <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </Pressable>
        </View>

        <Card style={styles.billingCard}>
          <View style={styles.billingHeader}>
            <View style={[styles.billingIcon, { backgroundColor: `${theme.accent}18` }]}>
              <Ionicons name="card-outline" size={22} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.labelS, { color: theme.accent }]}>Guide Billing</Text>
              <Text style={[typography.headingM, { color: theme.text, marginTop: spacing.xs }]}>
                {GUIDE_BILLING_RATE}
              </Text>
            </View>
          </View>

          <Text style={[typography.bodyS, styles.cardCopy, { color: theme.textSecondary }]}>
            Guide accounts are billed monthly so you can stay on the app, create routes, and get paid by users.
          </Text>

          <View style={styles.featureList}>
            {GUIDE_BILLING_FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: `${theme.accent}18` }]}>
                  <Ionicons name="checkmark" size={14} color={theme.accent} />
                </View>
                <Text style={[typography.bodyM, { color: theme.text, flex: 1 }]}>{feature}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={[typography.bodyS, { color: theme.textSecondary, marginBottom: spacing.md }]}>
            Payment method
          </Text>

          {cards.map((card) => (
            <PaymentMethodButton
              key={card.id}
              card={card}
              selected={card.id === selectedCardId}
              onPress={() => setSelectedCardId(card.id)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <PressableButton
            label={isAddCardOpen ? 'Hide Card Form' : 'Add New Card'}
            onPress={toggleAddCard}
            icon={isAddCardOpen ? 'chevron-up' : 'add'}
            variant="secondary"
          />

          {isAddCardOpen ? (
            <Card style={styles.formCard}>
              <StyledTextInput
                label="Card Number"
                keyboardType="number-pad"
                maxLength={19}
                onChangeText={(value) => setCardNumber(formatCardNumber(value))}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
              />
              <View style={styles.inlineFields}>
                <StyledTextInput
                  label="Expiry"
                  style={styles.inlineField}
                  maxLength={5}
                  onChangeText={(value) => setExpiry(formatExpiry(value))}
                  placeholder="MM/YY"
                  value={expiry}
                />
                <StyledTextInput
                  label="CVV"
                  style={styles.inlineField}
                  keyboardType="number-pad"
                  maxLength={4}
                  onChangeText={(value) => setCvv(value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  value={cvv}
                />
              </View>
              <View style={styles.actionRow}>
                <PressableButton
                  label="Save Card"
                  onPress={handleSaveCard}
                  disabled={!isAddCardValid}
                  style={styles.actionButton}
                />
                <PressableButton
                  label="Cancel"
                  onPress={toggleAddCard}
                  variant="ghost"
                  style={styles.actionButton}
                />
              </View>
            </Card>
          ) : null}
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.headingS, { color: theme.text }]}>Current billing rate</Text>
              <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 4 }]}>
                {selectedCard
                  ? `${GUIDE_BILLING_RATE} on ${selectedCard.brand} ending in ${selectedCard.last4}`
                  : GUIDE_BILLING_RATE}
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billingCard: {
    marginBottom: spacing.lg,
  },
  billingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billingIcon: {
    height: 44,
    width: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardCopy: {
    marginTop: spacing.sm,
  },
  featureList: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    height: 26,
    width: 26,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  cardButton: {
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMeta: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  defaultBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  formCard: {
    marginTop: spacing.md,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inlineField: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  summaryCard: {
    marginTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fullWidthButton: {
    marginTop: spacing.lg,
    width: '100%',
  },
});
