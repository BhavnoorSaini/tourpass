import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { AppButton } from '@/components/ui/AppButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { AppListRow } from '@/components/ui/AppListRow';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppSection } from '@/components/ui/AppSection';
import { AppText } from '@/components/ui/AppText';
import { supabase } from '@/lib/supabase';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

interface TourRequest {
  id: string;
  status: string;
  created_at: string;
  tourist_id: string;
  route_id: string;
  routes: { title: string } | null;
  profiles: { first_name: string | null; last_name: string | null } | null;
}

export default function GuideDashboardScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [userId, setUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<TourRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    setUserId(user.id);
    setLoading(true);

    const { data: myRoutes } = await supabase
      .from('routes')
      .select('id')
      .eq('creator_id', user.id);

    const routeIds = myRoutes?.map((route) => route.id) ?? [];

    if (routeIds.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('tour_requests')
      .select('id, status, created_at, tourist_id, route_id, routes(title), profiles!tourist_id(first_name, last_name)')
      .in('route_id', routeIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error) {
      setRequests((data as unknown as TourRequest[]) ?? []);
    }

    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchRequests();
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

    setRequests((previous) => previous.filter((row) => row.id !== request.id));
  };

  const handleDecline = async (request: TourRequest) => {
    Alert.alert('Decline request', 'Are you sure you want to decline this request?', [
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

          setRequests((previous) => previous.filter((row) => row.id !== request.id));
        },
      },
    ]);
  };

  return (
    <AppScreen contentContainerStyle={styles.screen}>
      <AppHeader
        backVisible
        eyebrow="Guide dashboard"
        title="Run incoming requests from a tighter operating surface."
        subtitle="Pending tours stay visible first, with only the numbers you need."
      />

      <AppSection title="Overview" subtitle="Current guide-facing snapshot">
        <View style={styles.metricRow}>
          <View style={styles.metricCell}>
            <AppText variant="label">Pending</AppText>
            <AppText variant="sectionTitle">{requests.length}</AppText>
          </View>
          <View style={styles.metricCell}>
            <AppText variant="label">Completed</AppText>
            <AppText variant="sectionTitle">0</AppText>
          </View>
          <View style={styles.metricCell}>
            <AppText variant="label">Earnings</AppText>
            <AppText variant="sectionTitle">$0</AppText>
          </View>
        </View>
      </AppSection>

      <AppSection title="Pending requests" subtitle="Accept or decline incoming tours">
        {loading ? (
          <View style={styles.loadingInline}>
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : requests.length === 0 ? (
          <AppText variant="body">No pending tour requests yet.</AppText>
        ) : (
          <View style={styles.stack}>
            {requests.map((request) => {
              const firstName = request.profiles?.first_name ?? '';
              const lastName = request.profiles?.last_name ?? '';
              const touristName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown traveler';
              const routeTitle = request.routes?.title ?? 'Unknown route';
              const isActioning = actionLoading === request.id;

              return (
                <View key={request.id} style={styles.requestBlock}>
                  <AppListRow
                    title={touristName}
                    subtitle={`${routeTitle} • ${new Date(request.created_at).toLocaleDateString()}`}
                    icon="person-outline"
                    trailingChevron={false}
                  />
                  <View style={styles.requestActions}>
                    <AppButton
                      label="Accept"
                      onPress={() => {
                        void handleAccept(request);
                      }}
                      loading={isActioning}
                      style={styles.actionButton}
                    />
                    <AppButton
                      label="Decline"
                      variant="secondary"
                      onPress={() => {
                        void handleDecline(request);
                      }}
                      disabled={isActioning}
                      style={styles.actionButton}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </AppSection>

      <AppSection title="Publishing" subtitle="Add a new route when you are ready">
        <AppButton
          label="Create new route"
          onPress={() => router.push('/(tabs)/home/create-route')}
          style={styles.publishButton}
        />
      </AppSection>
    </AppScreen>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    screen: {
      paddingTop: 16,
    },
    metricRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    metricCell: {
      flex: 1,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.xs,
      gap: 6,
    },
    loadingInline: {
      minHeight: 72,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stack: {
      gap: 16,
    },
    requestBlock: {
      gap: 8,
    },
    requestActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
    },
    publishButton: {
      alignSelf: 'flex-start',
      minWidth: 190,
    },
  });
