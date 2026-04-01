import { Alert, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

export default function PaymentsScreen() {
  const styles = useThemedStyles(createStyles);

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppHeader
        backVisible
        eyebrow="Payments"
        title="Billing and payouts without extra clutter."
        subtitle="This area is ready for cards, payout methods, and receipts."
      />

      <AppSection title="Current state" subtitle="What is already connected">
        <View style={styles.stack}>
          <View style={styles.row}>
            <AppText variant="label">Saved cards</AppText>
            <AppText variant="sectionTitle">0</AppText>
          </View>
          <View style={styles.row}>
            <AppText variant="label">Payout methods</AppText>
            <AppText variant="sectionTitle">0</AppText>
          </View>
          <View style={styles.row}>
            <AppText variant="label">Recent receipts</AppText>
            <AppText variant="sectionTitle">0</AppText>
          </View>
        </View>
      </AppSection>

      <AppSection title="Next step" subtitle="A stable handoff point for your future payment flow">
        <View style={styles.stack}>
          <AppText variant="body">
            Connect Stripe or your preferred billing provider here when payment plumbing is ready.
          </AppText>
          <AppButton
            label="Configure payments"
            onPress={() => Alert.alert('Coming soon', 'Payments configuration can be connected here.')}
            style={styles.button}
          />
        </View>
      </AppSection>
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
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    button: {
      alignSelf: 'flex-start',
      minWidth: 200,
    },
  });
