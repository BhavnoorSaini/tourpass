import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { PressableButton } from '@/components/ui/PressableButton';
import { supabase } from '@/lib/supabase';
import { border, useTheme } from '@/constants/theme';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface TourRequest {
  id: string;
  status: string;
  created_at: string;
  tourist_id: string;
  route_id: string;
  routes: { title: string } | null;
  profiles: { first_name: string | null; last_name: string | null } | null;
}

interface CustomRouteRequest {
  id: string;
  status: string;
  created_at: string;
  tourist_id: string;
  places: string;
  notes: string | null;
  request_date: string;
  profiles: { first_name: string | null; last_name: string | null } | null;
}

function MetricTile({ label, value }: { label: string; value: string | number }) {
  const theme = useTheme();

  return (
    <View style={[styles.metricTile, { backgroundColor: theme.background }]}>
      <Text style={[typography.headingS, { color: theme.text }]}>{value}</Text>
      <Text style={[typography.bodyS, styles.metricLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

function InlineActionButton({
  label,
  onPress,
  tone = 'primary',
}: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'danger';
}) {
  const theme = useTheme();
  const isDanger = tone === 'danger';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.inlineButton,
        isDanger
          ? {
              backgroundColor: 'transparent',
              borderColor: border(theme),
              borderWidth: 1,
            }
          : {
              backgroundColor: theme.accent,
            },
      ]}
    >
      <Text
        style={[
          typography.buttonM,
          { color: isDanger ? theme.text : theme.accentText },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function GuideDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<TourRequest[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRouteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRequests([]);
      setCustomRequests([]);
      setLoading(false);
      return;
    }

    setUserId(user.id);
    setLoading(true);

    const { data: myRoutes } = await supabase
      .from('routes')
      .select('id')
      .eq('creator_id', user.id);

    const routeIds = myRoutes?.map((route) => route.id) ?? [];

    const tourRequestsPromise =
      routeIds.length === 0
        ? Promise.resolve({ data: [] as TourRequest[], error: null })
        : supabase
            .from('tour_requests')
            .select(
              'id, status, created_at, tourist_id, route_id, routes(title), profiles!tourist_id(first_name, last_name)',
            )
            .in('route_id', routeIds)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

    const customRequestsPromise = supabase
      .from('custom_routes')
      .select(
        'id, status, created_at, tourist_id, places, notes, request_date, profiles!tourist_id(first_name, last_name)',
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    const [tourResult, customResult] = await Promise.all([
      tourRequestsPromise,
      customRequestsPromise,
    ]);

    if (!tourResult.error) {
      setRequests((tourResult.data as unknown as TourRequest[]) ?? []);
    }

    if (!customResult.error) {
      setCustomRequests(
        (customResult.data as unknown as CustomRouteRequest[]) ?? [],
      );
    }

    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests]),
  );

  const handleAccept = async (request: TourRequest) => {
    setActionLoading(request.id);

    const { error } = await supabase
      .from('tour_requests')
      .update({ status: 'accepted', guide_id: userId })
      .eq('id', request.id);

    setActionLoading(null);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setRequests((prev) => prev.filter((item) => item.id !== request.id));
  };

  const handleAcceptCustom = async (request: CustomRouteRequest) => {
    if (!userId) return;

    setActionLoading(request.id);

    // First-come first-served: only accept if still pending and unclaimed.
    const { data, error } = await supabase
      .from('custom_routes')
      .update({ status: 'accepted', guide_id: userId })
      .eq('id', request.id)
      .eq('status', 'pending')
      .is('guide_id', null)
      .select('id');

    setActionLoading(null);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    if (!data || data.length === 0) {
      Alert.alert(
        'Already Taken',
        'Another guide accepted this request first.',
      );
      setCustomRequests((prev) => prev.filter((item) => item.id !== request.id));
      return;
    }

    setCustomRequests((prev) => prev.filter((item) => item.id !== request.id));

    Alert.alert(
      'Request Accepted',
      'You are now matched with this traveler. Would you like to message them now?',
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Open Chat',
          onPress: () =>
            router.push(`/message/${request.id}?type=custom` as never),
        },
      ],
    );
  };

  const handleDeclineCustom = (request: CustomRouteRequest) => {
    // Declining just hides it locally — other guides can still accept.
    setCustomRequests((prev) => prev.filter((item) => item.id !== request.id));
  };

  const handleDecline = async (request: TourRequest) => {
    Alert.alert('Decline Request', 'Are you sure you want to decline this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(request.id);

          const { error } = await supabase
            .from('tour_requests')
            .update({ status: 'cancelled' })
            .eq('id', request.id);

          setActionLoading(null);

          if (error) {
            Alert.alert('Error', error.message);
            return;
          }

          setRequests((prev) => prev.filter((item) => item.id !== request.id));
        },
      },
    ]);
  };

  const completedCount = 0;
  const pendingCount = requests.length + customRequests.length;

  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ScreenHeader title="Guide Dashboard" onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
      >
        <Card style={styles.summaryCard}>
          <Text style={[typography.labelS, { color: theme.accent }]}>Guide Overview</Text>
          <Text style={[typography.headingM, styles.summaryTitle, { color: theme.text }]}>
            Manage requests and publish your next route.
          </Text>
          <Text style={[typography.bodyS, styles.summaryText, { color: theme.textSecondary }]}>
            Keep your guide profile active by responding to requests quickly and sharing fresh routes.
          </Text>

          <View style={styles.metricGrid}>
            <MetricTile label="Total Earnings" value="$0" />
            <MetricTile label="Completed Tours" value={completedCount} />
            <MetricTile label="Pending Requests" value={pendingCount} />
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={[typography.labelS, styles.sectionLabel, { color: theme.textSecondary }]}>
            Pending Requests
          </Text>

          <Card innerStyle={styles.requestsInner}>
            {loading ? (
              <View style={styles.stateBlock}>
                <ActivityIndicator color={theme.accent} />
              </View>
            ) : requests.length === 0 ? (
              <View style={styles.stateBlock}>
                <Text style={[typography.headingS, { color: theme.text }]}>
                  No requests yet
                </Text>
                <Text style={[typography.bodyS, styles.stateText, { color: theme.textSecondary }]}>
                  New booking requests will appear here as travelers discover your routes.
                </Text>
              </View>
            ) : (
              requests.map((request, index) => {
                const touristName =
                  [request.profiles?.first_name, request.profiles?.last_name]
                    .filter(Boolean)
                    .join(' ') || 'Unknown traveler';
                const routeTitle = request.routes?.title ?? 'Untitled route';
                const isActioning = actionLoading === request.id;

                return (
                  <View
                    key={request.id}
                    style={[
                      styles.requestRow,
                      index < requests.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: theme.background,
                      },
                    ]}
                  >
                    <View style={styles.requestCopy}>
                      <Text style={[typography.headingS, { color: theme.text }]}>
                        {touristName}
                      </Text>
                      <Text style={[typography.bodyS, styles.routeText, { color: theme.accent }]}>
                        {routeTitle}
                      </Text>
                      <Text style={[typography.bodyS, styles.dateText, { color: theme.textSecondary }]}>
                        {new Date(request.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    {isActioning ? (
                      <ActivityIndicator color={theme.accent} />
                    ) : (
                      <View style={styles.actionRow}>
                        <InlineActionButton
                          label="Accept"
                          onPress={() => handleAccept(request)}
                        />
                        <InlineActionButton
                          label="Decline"
                          tone="danger"
                          onPress={() => handleDecline(request)}
                        />
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[typography.labelS, styles.sectionLabel, { color: theme.textSecondary }]}>
            Custom Route Requests
          </Text>

          <Card innerStyle={styles.requestsInner}>
            {loading ? (
              <View style={styles.stateBlock}>
                <ActivityIndicator color={theme.accent} />
              </View>
            ) : customRequests.length === 0 ? (
              <View style={styles.stateBlock}>
                <Text style={[typography.headingS, { color: theme.text }]}>
                  No custom requests
                </Text>
                <Text style={[typography.bodyS, styles.stateText, { color: theme.textSecondary }]}>
                  Tourists looking for a bespoke tour will appear here. Requests are first-come
                  first-served.
                </Text>
              </View>
            ) : (
              customRequests.map((request, index) => {
                const touristName =
                  [request.profiles?.first_name, request.profiles?.last_name]
                    .filter(Boolean)
                    .join(' ') || 'Unknown traveler';
                const isActioning = actionLoading === request.id;
                const requestedOn = new Date(request.request_date);
                const requestedLabel = Number.isNaN(requestedOn.getTime())
                  ? request.request_date
                  : requestedOn.toLocaleString();

                return (
                  <View
                    key={request.id}
                    style={[
                      styles.requestRow,
                      index < customRequests.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: theme.background,
                      },
                    ]}
                  >
                    <View style={styles.requestCopy}>
                      <Text style={[typography.headingS, { color: theme.text }]}>
                        {touristName}
                      </Text>
                      <Text
                        style={[typography.bodyS, styles.routeText, { color: theme.accent }]}
                        numberOfLines={2}
                      >
                        {request.places}
                      </Text>
                      {request.notes ? (
                        <Text
                          style={[typography.bodyS, styles.dateText, { color: theme.textSecondary }]}
                          numberOfLines={2}
                        >
                          {request.notes}
                        </Text>
                      ) : null}
                      <Text
                        style={[typography.bodyS, styles.dateText, { color: theme.textSecondary }]}
                      >
                        Requested for {requestedLabel}
                      </Text>
                    </View>

                    {isActioning ? (
                      <ActivityIndicator color={theme.accent} />
                    ) : (
                      <View style={styles.actionRow}>
                        <InlineActionButton
                          label="Accept"
                          onPress={() => handleAcceptCustom(request)}
                        />
                        <InlineActionButton
                          label="Dismiss"
                          tone="danger"
                          onPress={() => handleDeclineCustom(request)}
                        />
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </Card>
        </View>

        <View style={styles.actionArea}>
          <Text style={[typography.bodyS, styles.actionText, { color: theme.textSecondary }]}>
            Create a new route to keep your guide profile fresh and bookable.
          </Text>
          <PressableButton
            label="Create New Route"
            onPress={() => router.push('/(tabs)/home/create-route')}
            icon="arrow-forward"
            style={styles.createButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  summaryCard: {
    marginTop: spacing.lg,
  },
  summaryTitle: {
    marginTop: spacing.xs,
  },
  summaryText: {
    marginTop: spacing.sm,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  metricTile: {
    flexGrow: 1,
    flexBasis: 96,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  metricLabel: {
    marginTop: 2,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionLabel: {
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
  },
  requestsInner: {
    paddingHorizontal: 0,
    paddingVertical: spacing.xs,
  },
  stateBlock: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  requestRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  requestCopy: {
    flex: 1,
  },
  routeText: {
    marginTop: 4,
  },
  dateText: {
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  inlineButton: {
    minWidth: 88,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  actionArea: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  actionText: {
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.md,
  },
  createButton: {
    width: '100%',
    maxWidth: 280,
    alignSelf: 'center',
  },
});
