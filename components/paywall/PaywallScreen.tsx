import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type PlanId = 'monthly' | 'annual';

interface PaywallScreenProps {
  onClose?: () => void;
  onContinue?: (selectedPlan: PlanId) => void;
}

const FEATURE_ITEMS = [
  'Unlimited self-guided routes in every city',
  'Offline access for your saved tours',
  'Premium audio insights and local tips',
  'Priority support while you travel',
];

const PLAN_OPTIONS: Array<{
  id: PlanId;
  title: string;
  price: string;
  badge?: string;
  description: string;
}> = [
  {
    id: 'monthly',
    title: 'Monthly',
    price: '$4.99/month',
    description: 'Flexible access for short trips and weekend adventures.',
  },
  {
    id: 'annual',
    title: 'Annual',
    price: '$39.99/year',
    badge: 'Best Value',
    description: 'Save more and keep premium features for every journey.',
  },
];

export function PaywallScreen({ onClose, onContinue }: PaywallScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('annual');

  const selectedPlanDetails = useMemo(
    () => PLAN_OPTIONS.find((plan) => plan.id === selectedPlan),
    [selectedPlan]
  );

  const handleSubscribe = () => {
    if (onContinue) {
      onContinue(selectedPlan);
      return;
    }

    console.log('Purchase triggered for plan:', selectedPlan);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    console.log('Paywall dismissed');
  };

  return (
    <LinearGradient colors={['#06141B', '#0B2733', '#102F3D']} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close paywall"
            hitSlop={12}
            onPress={handleClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={22} color="#E6F4F1" />
          </Pressable>
        </View>

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.iconShell}>
              <LinearGradient
                colors={['#6EE7C8', '#2DD4BF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGlow}
              >
                <Ionicons name="compass" size={34} color="#06252F" />
              </LinearGradient>
            </View>

            <Text style={styles.eyebrow}>Premium Access</Text>
            <Text style={styles.title}>Unlock Tourpass Premium</Text>
            <Text style={styles.subtitle}>
              Explore deeper, plan smarter, and travel with a smoother guided
              experience wherever you go.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Everything you get</Text>

            <View style={styles.featuresCard}>
              {FEATURE_ITEMS.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={16} color="#03212A" />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose your plan</Text>

            <View style={styles.planList}>
              {PLAN_OPTIONS.map((plan) => {
                const isSelected = selectedPlan === plan.id;

                return (
                  <Pressable
                    key={plan.id}
                    accessibilityRole="button"
                    onPress={() => setSelectedPlan(plan.id)}
                    style={[
                      styles.planCard,
                      isSelected && styles.planCardSelected,
                    ]}
                  >
                    <View style={styles.planHeader}>
                      <View>
                        <Text style={styles.planTitle}>{plan.title}</Text>
                        <Text style={styles.planPrice}>{plan.price}</Text>
                      </View>

                      {plan.badge ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{plan.badge}</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.planDescription}>{plan.description}</Text>

                    <View
                      style={[
                        styles.selectionIndicator,
                        isSelected && styles.selectionIndicatorActive,
                      ]}
                    >
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={20} color="#6EE7C8" />
                      ) : (
                        <Ionicons
                          name="ellipse-outline"
                          size={20}
                          color="rgba(230, 244, 241, 0.45)"
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={handleSubscribe} style={styles.ctaButton}>
            <Text style={styles.ctaText}>
              Continue with {selectedPlanDetails?.title ?? 'Selected Plan'}
            </Text>
          </Pressable>

          <View style={styles.secondaryActions}>
            <Pressable onPress={() => console.log('Restore Purchases pressed')}>
              <Text style={styles.secondaryText}>Restore Purchases</Text>
            </Pressable>

            <Pressable onPress={() => console.log('Terms of Service pressed')}>
              <Text style={styles.secondaryText}>Terms of Service</Text>
            </Pressable>

            <Pressable onPress={() => console.log('Privacy Policy pressed')}>
              <Text style={styles.secondaryText}>Privacy Policy</Text>
            </Pressable>
          </View>
        </View>
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
  headerActions: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  iconShell: {
    marginBottom: 18,
  },
  iconGlow: {
    alignItems: 'center',
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    shadowColor: '#6EE7C8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    width: 68,
  },
  eyebrow: {
    color: '#9EDFD3',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F6FFFC',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(230, 244, 241, 0.78)',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: '#F6FFFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  featuresCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    rowGap: 14,
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  checkIcon: {
    alignItems: 'center',
    backgroundColor: '#6EE7C8',
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    marginRight: 12,
    width: 22,
  },
  featureText: {
    color: '#E6F4F1',
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
  },
  planList: {
    rowGap: 14,
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  planCardSelected: {
    backgroundColor: 'rgba(110,231,200,0.1)',
    borderColor: '#6EE7C8',
    shadowColor: '#6EE7C8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  planHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  planTitle: {
    color: '#F6FFFC',
    fontSize: 18,
    fontWeight: '700',
  },
  planPrice: {
    color: '#9EDFD3',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#6EE7C8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#04232C',
    fontSize: 12,
    fontWeight: '800',
  },
  planDescription: {
    color: 'rgba(230, 244, 241, 0.74)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    paddingRight: 28,
  },
  selectionIndicator: {
    alignSelf: 'flex-end',
  },
  selectionIndicatorActive: {
    transform: [{ scale: 1.04 }],
  },
  footer: {
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: '#6EE7C8',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 18,
  },
  ctaText: {
    color: '#04232C',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 18,
    rowGap: 10,
    columnGap: 18,
  },
  secondaryText: {
    color: 'rgba(230, 244, 241, 0.76)',
    fontSize: 13,
    fontWeight: '600',
  },
});
