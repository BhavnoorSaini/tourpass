import {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { AppListRow } from '@/components/ui/AppListRow';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { AppSurface } from '@/components/ui/AppSurface';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

interface ProfileRow {
  first_name: string | null;
  last_name: string | null;
  is_guide: boolean | null;
  application_status: string | null;
}

interface ProfileMetrics {
  followers: number;
  following: number;
  posts: number;
  requestedTours: number;
}

type ProfileTab = 'overview' | 'activity' | 'account';

const profileTabs = [
  { label: 'Overview', value: 'overview' },
  { label: 'Activity', value: 'activity' },
  { label: 'Account', value: 'account' },
] as const satisfies readonly { label: string; value: ProfileTab }[];

const StatButton = memo(function StatButton({
  label,
  value,
  onPress,
}: {
  label: string;
  value: number;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.statButton}>
      <AppText variant="sectionTitle">{value}</AppText>
      <AppText variant="label">{label}</AppText>
      <AccentLine active />
    </Pressable>
  );
});

export default function ProfileScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [metrics, setMetrics] = useState<ProfileMetrics>({
    followers: 0,
    following: 0,
    posts: 0,
    requestedTours: 0,
  });
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      if (!user) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      const [profileResponse, postsResponse, requestsResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('first_name, last_name, is_guide, application_status')
          .eq('id', user.id)
          .single(),
        supabase
          .from('routes')
          .select('id', { count: 'exact', head: true })
          .eq('creator_id', user.id),
        supabase
          .from('tour_requests')
          .select('id', { count: 'exact', head: true })
          .eq('tourist_id', user.id),
      ]);

      if (!mounted) {
        return;
      }

      if (profileResponse.error) {
        setError(profileResponse.error.message);
        setProfile(null);
      } else {
        setProfile(profileResponse.data);
      }

      setMetrics({
        followers: 0,
        following: 0,
        posts: postsResponse.count ?? 0,
        requestedTours: requestsResponse.count ?? 0,
      });
      setLoading(false);
    };

    void fetchProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  const fullName = useMemo(
    () => [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Unknown User',
    [profile?.first_name, profile?.last_name],
  );

  const avatarUri = useMemo(() => {
    const seed = encodeURIComponent(fullName);
    return `https://ui-avatars.com/api/?name=${seed}&background=15120E&color=F7F3EB&size=256&bold=true`;
  }, [fullName]);

  const memberSince = useMemo(() => {
    if (!user?.created_at) {
      return 'Recently joined';
    }

    return new Date(user.created_at).toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric',
    });
  }, [user?.created_at]);

  const roleLabel = profile?.is_guide
    ? 'Guide'
    : profile?.application_status === 'pending'
      ? 'Guide applicant'
      : 'Traveler';

  const handleSocialStat = useCallback((label: string, value: number) => {
    const message =
      label === 'Posts'
        ? `${value} published route${value === 1 ? '' : 's'} on your profile.`
        : `${label} will become interactive once the social graph is connected.`;

    Alert.alert(label, message);
  }, []);

  const handleGuidePress = useCallback(() => {
    if (profile?.is_guide) {
      router.push('/profile/guide-dashboard');
      return;
    }

    if (profile?.application_status === 'pending') {
      Alert.alert('Application Under Review', 'Your guide application is still being reviewed.');
      return;
    }

    router.push('/profile/become-guide');
  }, [profile?.application_status, profile?.is_guide]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign out', 'Do you want to sign out of Tourpass?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          const { error: signOutError } = await supabase.auth.signOut();

          if (signOutError) {
            Alert.alert('Sign out failed', signOutError.message);
            return;
          }

          router.replace('/');
        },
      },
    ]);
  }, []);

  const quickActions = (
    <AppSection title="Quick actions" subtitle="Frequent destinations without extra chrome">
      <View style={styles.stack}>
        <AppListRow
          title="Payments"
          subtitle="Cards, payouts, and receipts"
          icon="card-outline"
          onPress={() => router.push('/profile/payments')}
        />
        <AppListRow
          title="Preferences"
          subtitle="Map display and interface settings"
          icon="options-outline"
          onPress={() => router.push('/profile/preferences')}
        />
        <AppListRow
          title="Help Center"
          subtitle="FAQs, support, and bug reports"
          icon="help-circle-outline"
          onPress={() => router.push('/profile/help-center')}
        />
      </View>
    </AppSection>
  );

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <AppText variant="eyebrow">Profile</AppText>
        <AppText variant="display" style={styles.headerTitle}>
          Your account, routes, and next moves in one place.
        </AppText>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.loadingState}>
          <AppText variant="sectionTitle">Could not load profile</AppText>
          <AppText variant="body">{error}</AppText>
        </View>
      ) : (
        <>
          <AppSurface style={styles.heroSurface}>
            <View style={styles.heroTop}>
              <Image source={avatarUri} style={styles.avatar} contentFit="cover" transition={120} />
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/profile/settings')}
                style={styles.headerIcon}
              >
                <Ionicons name="settings-outline" size={18} color={theme.colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.identityBlock}>
              <AppText variant="label">{roleLabel}</AppText>
              <AppText variant="screenTitle" style={styles.identityTitle}>
                {fullName}
              </AppText>
              <AppText variant="bodyStrong">{user?.email ?? 'Signed in'}</AppText>
              <AppText variant="caption">Member since {memberSince}</AppText>
            </View>

            <View style={styles.statsRow}>
              <StatButton
                label="Followers"
                value={metrics.followers}
                onPress={() => handleSocialStat('Followers', metrics.followers)}
              />
              <StatButton
                label="Following"
                value={metrics.following}
                onPress={() => handleSocialStat('Following', metrics.following)}
              />
              <StatButton
                label="Posts"
                value={metrics.posts}
                onPress={() => handleSocialStat('Posts', metrics.posts)}
              />
            </View>
          </AppSurface>

          <View style={styles.tabsWrap}>
            <AppSegmentedControl
              options={profileTabs}
              value={activeTab}
              onChange={(value) => {
                startTransition(() => {
                  setActiveTab(value);
                });
              }}
            />
          </View>

          {activeTab === 'overview' ? (
            <>
              <AppSection title="Guide status" subtitle="The shortest path to the next role">
                <View style={styles.stack}>
                  <AppText variant="body">
                    {profile?.is_guide
                      ? 'Your guide tools are ready. Open the dashboard to manage incoming requests.'
                      : profile?.application_status === 'pending'
                        ? 'Your guide application is in review. We will notify you once it has been processed.'
                        : 'Apply to become a guide and turn your local knowledge into publishable routes.'}
                  </AppText>
                  <AppButton
                    label={profile?.is_guide ? 'Open dashboard' : 'Guide journey'}
                    onPress={handleGuidePress}
                    style={styles.inlineButton}
                  />
                </View>
              </AppSection>
              {quickActions}
              <AppSection title="Snapshot" subtitle="A compact read of your current account">
                <View style={styles.metricGrid}>
                  <View style={styles.metricCell}>
                    <AppText variant="label">Public posts</AppText>
                    <AppText variant="sectionTitle">{metrics.posts}</AppText>
                  </View>
                  <View style={styles.metricCell}>
                    <AppText variant="label">Tour requests</AppText>
                    <AppText variant="sectionTitle">{metrics.requestedTours}</AppText>
                  </View>
                  <View style={styles.metricCell}>
                    <AppText variant="label">Status</AppText>
                    <AppText variant="sectionTitle">{roleLabel}</AppText>
                  </View>
                  <View style={styles.metricCell}>
                    <AppText variant="label">Member since</AppText>
                    <AppText variant="sectionTitle">{memberSince}</AppText>
                  </View>
                </View>
              </AppSection>
            </>
          ) : null}

          {activeTab === 'activity' ? (
            <>
              <AppSection title="Highlights" subtitle="Signals taken from your live account state">
                <View style={styles.metricGrid}>
                  <View style={styles.metricCell}>
                    <AppText variant="label">Published routes</AppText>
                    <AppText variant="sectionTitle">{metrics.posts}</AppText>
                    <AppText variant="caption">
                      {metrics.posts > 0
                        ? 'Routes currently visible on your profile.'
                        : 'Publish your first route to establish your presence.'}
                    </AppText>
                  </View>
                  <View style={styles.metricCell}>
                    <AppText variant="label">Requested tours</AppText>
                    <AppText variant="sectionTitle">{metrics.requestedTours}</AppText>
                    <AppText variant="caption">
                      {metrics.requestedTours > 0
                        ? 'Walks you have already asked to join.'
                        : 'Browse Explore and request a route to start.'}
                    </AppText>
                  </View>
                </View>
              </AppSection>
              <AppSection title="Keep moving" subtitle="Next useful actions based on your current profile">
                <View style={styles.stack}>
                  {metrics.posts === 0 ? (
                    <AppListRow
                      title="Publish your first route"
                      subtitle="Create a new route and make it visible on your profile."
                      icon="map-outline"
                      onPress={() => router.push('/(tabs)/home/create-route')}
                    />
                  ) : null}
                  {!profile?.is_guide && profile?.application_status !== 'pending' ? (
                    <AppListRow
                      title="Apply to become a guide"
                      subtitle="Open the guide flow and complete your setup."
                      icon="compass-outline"
                      onPress={() => router.push('/profile/become-guide')}
                    />
                  ) : null}
                  <AppListRow
                    title="Edit profile"
                    subtitle="Refresh your name and personal details."
                    icon="create-outline"
                    onPress={() => router.push('/profile/settings/edit-profile')}
                  />
                </View>
              </AppSection>
            </>
          ) : null}

          {activeTab === 'account' ? (
            <>
              <AppSection title="Manage account" subtitle="Settings and profile tools">
                <View style={styles.stack}>
                  <AppListRow
                    title="Edit profile"
                    subtitle="Update the information shown on your account."
                    icon="person-outline"
                    onPress={() => router.push('/profile/settings/edit-profile')}
                  />
                  <AppListRow
                    title="Settings"
                    subtitle="Security, privacy, and account actions."
                    icon="settings-outline"
                    onPress={() => router.push('/profile/settings')}
                  />
                  <AppListRow
                    title="Preferences"
                    subtitle="Map display and interface choices."
                    icon="options-outline"
                    onPress={() => router.push('/profile/preferences')}
                  />
                </View>
              </AppSection>
              <AppSection title="Support" subtitle="Payments, help, and session control">
                <View style={styles.stack}>
                  <AppListRow
                    title="Payments"
                    subtitle="Billing, payout, and payment settings."
                    icon="card-outline"
                    onPress={() => router.push('/profile/payments')}
                  />
                  <AppListRow
                    title="Help Center"
                    subtitle="FAQs, support, and bug reporting."
                    icon="help-buoy-outline"
                    onPress={() => router.push('/profile/help-center')}
                  />
                  <AppListRow
                    title="Sign out"
                    subtitle="End this session on the current device."
                    icon="log-out-outline"
                    destructive
                    onPress={handleSignOut}
                  />
                </View>
              </AppSection>
            </>
          ) : null}
        </>
      )}
    </AppScreen>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    screen: {
      paddingTop: theme.spacing.sm,
    },
    header: {
      marginBottom: theme.spacing.lg,
      maxWidth: 360,
    },
    headerTitle: {
      marginTop: theme.spacing.xs,
    },
    loadingState: {
      minHeight: 320,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
    heroSurface: {
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    heroTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    avatar: {
      width: 92,
      height: 92,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
    },
    headerIcon: {
      width: 44,
      height: 44,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    identityBlock: {
      marginBottom: theme.spacing.sm,
      gap: 4,
    },
    identityTitle: {
      marginTop: 4,
      marginBottom: 4,
    },
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    statButton: {
      flex: 1,
      minHeight: 92,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
      padding: theme.spacing.xs,
      justifyContent: 'space-between',
    },
    tabsWrap: {
      marginBottom: theme.spacing.lg,
    },
    stack: {
      gap: theme.spacing.xs,
    },
    inlineButton: {
      alignSelf: 'flex-start',
      minWidth: 180,
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    metricCell: {
      width: '48%',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.xs,
      gap: 6,
    },
  });
