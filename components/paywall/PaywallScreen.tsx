import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { PressableButton } from '@/components/ui/PressableButton';
import { border, useTheme } from '@/constants/theme';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

export type PlanId = 'monthly' | 'annual';

interface PaywallScreenProps {
	onClose?: () => void;
	onContinue?: (selectedPlan: PlanId) => void;
	presentation?: 'screen' | 'modal';
}

const FEATURE_ITEMS = [
	'Unlimited routes',
	'Offline access',
	'Premium audio tips',
	'Priority support',
];

const PLAN_OPTIONS: Array<{
	id: PlanId;
	title: string;
	price: string;
	badge?: string;
}> = [
	{
		id: 'monthly',
		title: 'Monthly',
		price: '$4.99 / month',
	},
	{
		id: 'annual',
		title: 'Annual',
		price: '$39.99 / year',
		badge: 'Best Value',
	},
];

function PlanButton({
	title,
	price,
	badge,
	selected,
	onPress,
}: {
	title: string;
	price: string;
	badge?: string;
	selected: boolean;
	onPress: () => void;
}) {
	const theme = useTheme();
	const planStyle = {
		...styles.planCard,
		borderWidth: 1,
		borderColor: selected ? theme.accent : border(theme),
	};

	return (
		<Card onPress={onPress} style={planStyle}>
			<View style={styles.planRow}>
				<View style={{ flex: 1 }}>
					<Text style={[typography.headingS, { color: theme.text }]}>{title}</Text>
					<Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 4 }]}>{price}</Text>
				</View>

				<View style={styles.planActions}>
					{badge ? (
						<View style={[styles.badge, { backgroundColor: `${theme.accent}18` }]}>
							<Text style={[typography.labelS, { color: theme.accent }]}>{badge}</Text>
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

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
	const theme = useTheme();

	return (
		<Pressable onPress={onPress} style={[styles.secondaryButton, { borderColor: border(theme) }]}>
			<Text style={[typography.buttonM, { color: theme.text }]}>{label}</Text>
		</Pressable>
	);
}

export function PaywallScreen({
	onClose,
	onContinue,
	presentation = 'screen',
}: PaywallScreenProps) {
	const theme = useTheme();
	const [selectedPlan, setSelectedPlan] = useState<PlanId>('annual');
	const isModal = presentation === 'modal';

	const selectedPlanDetails = useMemo(
		() => PLAN_OPTIONS.find((plan) => plan.id === selectedPlan),
		[selectedPlan]
	);

	const handleClose = () => {
		if (onClose) {
			onClose();
			return;
		}
	};

	const handleSubscribe = () => {
		if (onContinue) {
			onContinue(selectedPlan);
			return;
		}

		console.log('Purchase triggered for plan:', selectedPlan);
	};

	return (
		<View
			style={[
				styles.root,
				{
					backgroundColor: theme.background,
					borderRadius: isModal ? radius.xl : 0,
				},
			]}
		>
			<SafeAreaView style={styles.safeArea}>
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
					<View style={styles.header}>
						<View style={styles.headerCopy}>
							<Text style={[typography.labelM, { color: theme.textSecondary }]}>
								Tour Pass Premium
							</Text>
							<Text style={[typography.headingM, { color: theme.text, marginTop: spacing.xs }]}>
								Pick a plan
							</Text>
						</View>

						<Pressable onPress={handleClose} style={styles.iconButton} hitSlop={12}>
							<Ionicons name="close" size={20} color={theme.text} />
						</Pressable>
					</View>

					<Card style={styles.heroCard}>
						<View style={styles.heroRow}>
							<View style={[styles.heroIcon, { backgroundColor: `${theme.accent}18` }]}>
								<Ionicons name="sparkles-outline" size={20} color={theme.accent} />
							</View>
							<View style={{ flex: 1 }}>
								<Text style={[typography.headingS, { color: theme.text }]}>
									Unlock Tour Pass Premium
								</Text>
								<Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 4 }]}>
									Choose subscription type.
								</Text>
							</View>
						</View>
					</Card>

					<View style={styles.section}>
						<Text style={[typography.bodyS, { color: theme.textSecondary, marginBottom: spacing.md }]}>
							Included features
						</Text>

						{FEATURE_ITEMS.map((feature) => (
							<Card key={feature} style={styles.featureCard}>
								<View style={styles.featureRow}>
									<View style={[styles.featureIcon, { backgroundColor: `${theme.accent}18` }]}>
										<Ionicons name="checkmark" size={16} color={theme.accent} />
									</View>
									<Text style={[typography.bodyM, { color: theme.text }]}>{feature}</Text>
								</View>
							</Card>
						))}
					</View>

					<View style={styles.section}>
						<Text style={[typography.bodyS, { color: theme.textSecondary, marginBottom: spacing.md }]}>
							Plans
						</Text>

						{PLAN_OPTIONS.map((plan) => (
							<PlanButton
								key={plan.id}
								title={plan.title}
								price={plan.price}
								badge={plan.badge}
								selected={selectedPlan === plan.id}
								onPress={() => setSelectedPlan(plan.id)}
							/>
						))}
					</View>

					<Card style={styles.selectedCard}>
						<View style={styles.selectedRow}>
							<View>
								<Text style={[typography.labelS, { color: theme.textSecondary }]}>Selected</Text>
								<Text style={[typography.headingS, { color: theme.text, marginTop: 4 }]}>
									{selectedPlanDetails?.title}
								</Text>
							</View>
							<Text style={[typography.buttonL, { color: theme.accent }]}>
								{selectedPlanDetails?.price}
							</Text>
						</View>
					</Card>

					<View style={styles.primaryAction}>
						<PressableButton
							label={`Continue with ${selectedPlanDetails?.title ?? 'Plan'}`}
							onPress={handleSubscribe}
							icon="arrow-forward"
						/>
					</View>

					<View style={styles.secondaryRow}>
						<SecondaryButton
							label="Restore"
							onPress={() => console.log('Restore Purchases pressed')}
						/>
						<SecondaryButton
							label="Terms"
							onPress={() => console.log('Terms of Service pressed')}
						/>
						<SecondaryButton
							label="Privacy"
							onPress={() => console.log('Privacy Policy pressed')}
						/>
					</View>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		overflow: 'hidden',
	},
	safeArea: {
		flex: 1,
	},
	scroll: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.xxl,
		paddingTop: spacing.md,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: spacing.lg,
	},
	headerCopy: {
		flex: 1,
	},
	iconButton: {
		height: 40,
		width: 40,
		borderRadius: radius.full,
		alignItems: 'center',
		justifyContent: 'center',
	},
	heroCard: {
		marginBottom: spacing.lg,
	},
	heroRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	heroIcon: {
		height: 44,
		width: 44,
		borderRadius: radius.md,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.md,
	},
	section: {
		marginBottom: spacing.lg,
	},
	featureCard: {
		marginBottom: spacing.sm,
	},
	featureRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	featureIcon: {
		height: 32,
		width: 32,
		borderRadius: radius.md,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.md,
	},
	planCard: {
		marginBottom: spacing.sm,
	},
	planRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	planActions: {
		alignItems: 'flex-end',
		gap: spacing.sm,
	},
	badge: {
		borderRadius: radius.full,
		paddingHorizontal: spacing.md,
		paddingVertical: 6,
	},
	selectedCard: {
		marginBottom: spacing.lg,
	},
	selectedRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	primaryAction: {
		marginBottom: spacing.md,
	},
	secondaryRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.sm,
	},
	secondaryButton: {
		minHeight: 40,
		paddingHorizontal: spacing.lg,
		borderRadius: radius.full,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
