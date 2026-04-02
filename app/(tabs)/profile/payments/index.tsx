import { router } from 'expo-router';
import { PaywallScreen, type PlanId } from '@/components/paywall/PaywallScreen';

export default function PaymentsScreen() {
  const handleContinue = (selectedPlan: PlanId) => {
    router.push({
      pathname: '/profile/payments/wallet',
      params: { plan: selectedPlan },
    });
  };

  return <PaywallScreen onClose={() => router.back()} onContinue={handleContinue} />;
}
