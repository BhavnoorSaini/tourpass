import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';
import { PressableButton } from '@/components/ui/PressableButton';
import { RequestStatusList } from '@/components/profile/RequestStatusList';

interface ProfileRow {
  first_name: string | null;
  last_name: string | null;
  is_guide: boolean | null;
  application_status: string | null;
}

function NavRow({ icon, label, onPress, isLast = false }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void; isLast?: boolean }) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.navRow,
        {
          backgroundColor: pressed ? theme.surfaceRaised : 'transparent',
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.background,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={theme.text} />
      <Text style={[typography.bodyM, { color: theme.text, flex: 1, marginLeft: spacing.md }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, is_guide, application_status')
        .eq('id', user.id)
        .single();
      if (!error) setProfile(data);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'User';
  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator color={theme.text} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Pressable onPress={() => router.push('/profile/settings')} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color={theme.text} />
        </Pressable>

        <View style={styles.avatarBlock}>
          <View style={[styles.avatar, { backgroundColor: theme.surface }]}>
            <Text style={[typography.headingL, { color: theme.text }]}>{initials}</Text>
          </View>
          <Text style={[typography.headingM, { color: theme.text, marginTop: spacing.md }]}>
            {fullName}
          </Text>
          <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 2 }]}>
            {user?.email}
          </Text>
        </View>

        <View style={[styles.statsRow, { backgroundColor: theme.surface }]}>
          <View style={styles.statItem}>
            <Text style={[typography.headingM, { color: theme.text }]}>12</Text>
            <Text style={[typography.labelS, { color: theme.textSecondary, marginTop: 4 }]}>Tours</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.background }]} />
          <View style={styles.statItem}>
            <Text style={[typography.headingM, { color: theme.text }]}>5</Text>
            <Text style={[typography.labelS, { color: theme.textSecondary, marginTop: 4 }]}>Cities</Text>
          </View>
        </View>

        {/* ── RESTORED PERFECT VERSION: Without 'Join' text ── */}
        {!profile?.is_guide && profile?.application_status === 'none' && (
          <View style={styles.guideJourney}>
            <View style={[styles.guideJourneyContent, { backgroundColor: theme.surface }]}>
              <View style={styles.guideTextSection}>
                <Text style={[typography.headingS, { color: theme.text }]}>
                  Share your city
                </Text>
                <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 2 }]} numberOfLines={2}>
                  Turn your local knowledge into income.
                </Text>
              </View>

              <PressableButton
                label="Apply"
                onPress={() => router.push('/profile/become-guide')}
                style={styles.guideStartBtnJoin}
                icon="arrow-forward"
              />
            </View>
          </View>
        )}

        {!profile?.is_guide && <RequestStatusList />}

        {profile?.is_guide && (
          <View
            style={[
              styles.guideCard,
              { backgroundColor: theme.surface },
            ]}
          >
            <View style={styles.guideCardContent}>
              <Text style={[typography.labelS, { color: theme.accent }]}>Guide dashboard</Text>
              <Text style={[typography.headingS, styles.guideCardTitle, { color: theme.text }]}>
                View your guide activity
              </Text>
              <View style={styles.guideStats}>
                <View style={styles.guideStat}>
                  <Text style={[typography.headingM, { color: theme.text }]}>$0</Text>
                  <Text style={[typography.labelS, { color: theme.textSecondary }]}>Earned</Text>
                </View>
                <View style={styles.guideStat}>
                  <Text style={[typography.headingM, { color: theme.text }]}>0</Text>
                  <Text style={[typography.labelS, { color: theme.textSecondary }]}>Active</Text>
                </View>
              </View>
              <PressableButton
                label="Open Guide Dashboard"
                onPress={() => router.push('/profile/guide-dashboard')}
                style={styles.guideDashboardButton}
              />
            </View>
          </View>
        )}

        <View style={[styles.navSection, { backgroundColor: theme.surface }]}>
          <NavRow icon="card-outline" label="Payments" onPress={() => router.push('/profile/payments')} />
          <NavRow icon="options-outline" label="Preferences" onPress={() => router.push('/profile/preferences')} />
          <NavRow icon="help-circle-outline" label="Help Center" onPress={() => router.push('/profile/help-center')} isLast />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: spacing.xxl },
  settingsBtn: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 1,
  },
  avatarBlock: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: spacing.md,
  },
  guideJourney: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  guideJourneyContent: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  guideTextSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  guideStartBtnJoin: {
    height: 40,
    minWidth: 80,
    paddingHorizontal: spacing.md,
  },
  guideCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideCardContent: {
    alignItems: 'center',
  },
  guideCardTitle: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  guideStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  guideStat: {
    minWidth: 92,
    alignItems: 'center',
  },
  guideDashboardButton: {
    marginTop: spacing.lg,
    minWidth: 220,
  },
  navSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
});
