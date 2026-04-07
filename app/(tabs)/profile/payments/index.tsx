import { useState } from 'react';
import {
	Alert,
	LayoutAnimation,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	UIManager,
	View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PaywallScreen, type PlanId } from '@/components/paywall/PaywallScreen';
import { Card } from '@/components/ui/Card';
import { PressableButton } from '@/components/ui/PressableButton';
import { StyledTextInput } from '@/components/ui/StyledTextInput';
import { border, useTheme } from '@/constants/theme';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

type SavedCard = {
	id: string;
	brand: string;
	last4: string;
	expiry: string;
	label: string;
	isDefault?: boolean;
};

function formatCardNumber(value: string) {
	const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
	return digitsOnly.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
	const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
	if (digitsOnly.length < 3) return digitsOnly;
	return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

const INITIAL_CARDS: SavedCard[] = [
	{
		id: '1',
		brand: 'Visa',
		last4: '4242',
		expiry: '08/28',
		label: 'Travel rewards',
		isDefault: true,
	},
	{
		id: '2',
		brand: 'Mastercard',
		last4: '1881',
		expiry: '11/27',
		label: 'Personal card',
	},
];

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

export default function PaymentsScreen() {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const [cards, setCards] = useState(INITIAL_CARDS);
	const [selectedCardId, setSelectedCardId] = useState(INITIAL_CARDS[0]?.id ?? '');
	const [isAddCardOpen, setIsAddCardOpen] = useState(false);
	const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);
	const [cardNumber, setCardNumber] = useState('');
	const [expiry, setExpiry] = useState('');
	const [cvv, setCvv] = useState('');

	const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];
	const isAddCardValid =
		cardNumber.trim().length >= 19 && expiry.trim().length === 5 && cvv.trim().length >= 3;

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
				label: 'New payment method',
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

	const handlePremiumContinue = (selectedPlan: PlanId) => {
		setIsPremiumModalVisible(false);
		console.log('Purchase triggered for plan:', selectedPlan);
	};

	return (
		<View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
				<View style={styles.headerRow}>
					<View style={{ flex: 1 }}>
						<Text style={[typography.labelM, { color: theme.textSecondary }]}>Payments</Text>
						<Text style={[typography.headingM, { color: theme.text, marginTop: spacing.xs }]}>
							Choose a payment method
						</Text>
					</View>

					<Pressable
						onPress={() => router.back()}
						style={styles.iconButton}
						hitSlop={12}
					>
						<Ionicons name="arrow-back" size={20} color={theme.text} />
					</Pressable>
				</View>

				<View style={styles.section}>
					<Text style={[typography.bodyS, { color: theme.textSecondary, marginBottom: spacing.md }]}>
						Saved cards
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

				<Card style={styles.summaryCard}>
					<View style={styles.summaryRow}>
						<View style={{ flex: 1 }}>
							<Text style={[typography.headingS, { color: theme.text }]}>Active card</Text>
							<Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 4 }]}>
								{selectedCard ? `${selectedCard.brand} ending in ${selectedCard.last4}` : 'No card selected'}
							</Text>
						</View>
						<Ionicons name="checkmark-circle" size={20} color={theme.accent} />
					</View>
				</Card>

				<View style={styles.section}>
					<PressableButton
						label={isAddCardOpen ? 'Hide Card Form' : 'Add New Card'}
						onPress={toggleAddCard}
						icon={isAddCardOpen ? 'chevron-up' : 'add'}
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

				<Card style={styles.premiumCard}>
					<View style={styles.premiumHeader}>
						<View style={[styles.premiumIcon, { backgroundColor: `${theme.accent}18` }]}>
							<Ionicons name="sparkles-outline" size={20} color={theme.accent} />
						</View>
						<View style={{ flex: 1 }}>
							<Text style={[typography.headingS, { color: theme.text }]}>Tour Pass Premium</Text>
							<Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 2 }]}>
								Upgrade for exlcusive features.
							</Text>
						</View>
					</View>

					<PressableButton
						label="Open Tour Pass Premium"
						onPress={() => setIsPremiumModalVisible(true)}
						icon="arrow-forward"
						style={styles.premiumButton}
					/>
				</Card>
			</ScrollView>

			<Modal
				animationType="slide"
				onRequestClose={() => setIsPremiumModalVisible(false)}
				presentationStyle="overFullScreen"
				transparent
				visible={isPremiumModalVisible}
			>
				<Pressable
					style={[styles.modalBackdrop, { backgroundColor: 'rgba(20, 19, 17, 0.36)' }]}
					onPress={() => setIsPremiumModalVisible(false)}
				>
					<Pressable onPress={() => {}} style={styles.modalShell}>
						<PaywallScreen
							onClose={() => setIsPremiumModalVisible(false)}
							onContinue={handlePremiumContinue}
							presentation="modal"
						/>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
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
	summaryCard: {
		marginBottom: spacing.lg,
	},
	summaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
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
	premiumCard: {
		marginTop: spacing.sm,
	},
	premiumHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: spacing.lg,
	},
	premiumIcon: {
		height: 40,
		width: 40,
		borderRadius: radius.md,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.md,
	},
	premiumButton: {
		alignSelf: 'flex-start',
		minWidth: 220,
	},
	modalBackdrop: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: spacing.md,
	},
	modalShell: {
		width: '100%',
		maxWidth: 440,
		height: '88%',
		minHeight: 560,
		maxHeight: 760,
	},
});
