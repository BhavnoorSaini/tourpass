import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';

interface RouteRow {
  id: string;
  title: string;
  description: string | null;
  city: string;
  is_public: boolean;
  created_at: string;
  route_data: {
    stops: { name: string; fullAddress: string; coordinate?: [number, number] }[];
    durationSeconds: number;
    distanceMeters: number;
  };
  profiles: { first_name: string | null; last_name: string | null }[] | null;
}

interface Bounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

function parseBounds(params: Record<string, string | string[] | undefined>): Bounds | null {
  const pick = (key: string) => {
    const value = params[key];
    const normalized = Array.isArray(value) ? value[0] : value;
    return normalized && normalized.length > 0 ? normalized : undefined;
  };

  const minLngS = pick('minLng');
  const maxLngS = pick('maxLng');
  const minLatS = pick('minLat');
  const maxLatS = pick('maxLat');

  if (!minLngS || !maxLngS || !minLatS || !maxLatS) {
    return null;
  }

  const minLng = Number(minLngS);
  const maxLng = Number(maxLngS);
  const minLat = Number(minLatS);
  const maxLat = Number(maxLatS);

  if ([minLng, maxLng, minLat, maxLat].some((value) => !Number.isFinite(value))) {
    return null;
  }

  return { minLng, maxLng, minLat, maxLat };
}

function routeInBounds(route: RouteRow, bounds: Bounds): boolean {
  const coordinate = route.route_data?.stops?.[0]?.coordinate;

  if (!coordinate || coordinate.length !== 2) {
    return false;
  }

  const [lng, lat] = coordinate;
  return lng >= bounds.minLng && lng <= bounds.maxLng && lat >= bounds.minLat && lat <= bounds.maxLat;
}

function formatDistance(meters: number) {
  const km = meters / 1000;
  return km >= 10 ? `${km.toFixed(0)} km` : `${km.toFixed(1)} km`;
}

function formatDuration(seconds: number) {
  const total = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (!hours) {
    return `${total} min`;
  }

  if (!minutes) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

function RouteCard({
  route,
  featured = false,
  onPress,
}: {
  route: RouteRow;
  featured?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);
  const stopCount = route.route_data?.stops?.length ?? 0;
  const duration = route.route_data?.durationSeconds;
  const distance = route.route_data?.distanceMeters;
  const guideFirst = route.profiles?.[0]?.first_name ?? '';
  const guideLast = route.profiles?.[0]?.last_name ?? '';
  const guideName = [guideFirst, guideLast].filter(Boolean).join(' ') || 'Local Guide';

  const metadata = [
    duration != null ? formatDuration(duration) : null,
    distance != null ? formatDistance(distance) : null,
    `${stopCount} stop${stopCount !== 1 ? 's' : ''}`,
  ].filter(Boolean);

  const hasValidTitle =
    route.title &&
    route.title.trim().length > 0 &&
    !route.title.includes(',');
  const displayTitle = hasValidTitle ? route.title : (route.city?.split(',')[0] || 'Local Tour');
  const displayCity = route.city || 'Various Locations';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: featured ? theme.accent : 'transparent',
          borderWidth: featured ? 1.5 : 0,
          opacity: pressed ? 0.92 : 1,
          shadowColor: theme.accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          {featured ? (
            <Text style={[typography.labelS, styles.featuredLabel, { color: theme.accent }]}>
              OPENED FROM MAP
            </Text>
          ) : null}
          <Text style={[typography.headingM, { color: theme.text }]} numberOfLines={2}>
            {displayTitle}
          </Text>
          <Text
            style={[typography.labelS, { color: theme.textSecondary, marginTop: 4 }]}
            numberOfLines={1}
          >
            {displayCity}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        {metadata.map((meta, index) => (
          <View key={meta} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[typography.bodyS, { color: theme.textSecondary }]}>{meta}</Text>
            {index < metadata.length - 1 ? (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: theme.textSecondary, opacity: 0.3 },
                ]}
              />
            ) : null}
          </View>
        ))}
      </View>

      {route.description ? (
        <Text
          style={[typography.bodyS, { color: theme.textSecondary, marginTop: spacing.xs }]}
          numberOfLines={2}
        >
          {route.description}
        </Text>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={[typography.labelS, { color: theme.accent, fontSize: 10, letterSpacing: 1 }]}>
          {guideName.toUpperCase()}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={theme.textTertiary} />
      </View>
    </Pressable>
  );
}

export default function ExploreRoutesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    minLng?: string | string[];
    maxLng?: string | string[];
    minLat?: string | string[];
    maxLat?: string | string[];
    routeId?: string | string[];
  }>();
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const focusedRouteParam = Array.isArray(params.routeId) ? params.routeId[0] : params.routeId;
  const focusedRouteId = focusedRouteParam && focusedRouteParam.length > 0 ? focusedRouteParam : null;
  const bounds = useMemo(
    () => parseBounds(params as Record<string, string | string[] | undefined>),
    [params],
  );

  const focusedRoute = useMemo(
    () => (focusedRouteId ? routes.find((route) => route.id === focusedRouteId) ?? null : null),
    [focusedRouteId, routes],
  );
  const visibleRoutes = useMemo(() => {
    if (focusedRouteId) {
      return focusedRoute ? [focusedRoute] : [];
    }

    return bounds ? routes.filter((route) => routeInBounds(route, bounds)) : routes;
  }, [bounds, focusedRoute, focusedRouteId, routes]);

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('routes')
        .select(
          'id, title, description, city, is_public, created_at, route_data, profiles(first_name, last_name)',
        )
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setRoutes((data as unknown as RouteRow[]) ?? []);
      }

      setLoading(false);
    };

    fetchRoutes();
  }, []);

  const handleCardPress = (route: RouteRow) => {
    Alert.alert(`Request "${route.title}"?`, 'This will notify the guide.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Request', onPress: () => submitRequest(route) },
    ]);
  };

  const submitRequest = async (route: RouteRow) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Sign in', 'Please sign in first.');
      return;
    }

    const { error: requestError } = await supabase
      .from('tour_requests')
      .insert({ tourist_id: user.id, route_id: route.id, status: 'pending' });

    if (requestError) {
      Alert.alert('Failed', requestError.message);
      return;
    }

    Alert.alert('Sent', 'Request submitted!');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/home');
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: theme.surface }]}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={[typography.displayL, { color: theme.text }]}>Explore</Text>
          <Text style={[typography.bodyS, { color: theme.textSecondary }]}>
            Browse public routes without leaving the map flow.
          </Text>
        </View>
      </View>

      {focusedRouteId ? (
        <View style={[styles.filterBar, { backgroundColor: theme.surface }]}>
          <Ionicons name="pin" size={14} color={theme.accent} />
          <Text
            style={[typography.bodyS, { color: theme.text, flex: 1, marginLeft: spacing.xs }]}
            numberOfLines={1}
          >
            {focusedRoute
              ? `Showing ${focusedRoute.title || 'the selected route'}`
              : 'Showing route from the selected map pin'}
          </Text>
          <Pressable onPress={() => router.setParams({ routeId: '' })} hitSlop={8}>
            <Text style={[typography.labelS, { color: theme.accent }]}>SHOW ALL</Text>
          </Pressable>
        </View>
      ) : null}

      {bounds && !focusedRouteId ? (
        <View style={[styles.filterBar, { backgroundColor: theme.surface }]}>
          <Ionicons name="locate" size={14} color={theme.accent} />
          <Text style={[typography.bodyS, { color: theme.text, flex: 1, marginLeft: spacing.xs }]}>
            Filtered to current map area
            {!loading ? ` · ${visibleRoutes.length} route${visibleRoutes.length === 1 ? '' : 's'}` : ''}
          </Text>
          <Pressable
            onPress={() => router.setParams({ minLng: '', maxLng: '', minLat: '', maxLat: '' })}
            hitSlop={8}
          >
            <Text style={[typography.labelS, { color: theme.accent }]}>CLEAR</Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[typography.bodyM, { color: theme.destructive }]}>{error}</Text>
        </View>
      ) : visibleRoutes.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[typography.bodyM, { color: theme.textSecondary }]}>
            {focusedRouteId
              ? 'That route is no longer available.'
              : bounds
                ? 'No routes start inside this map area.'
                : 'No routes found.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleRoutes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RouteCard
              route={item}
              featured={item.id === focusedRouteId}
              onPress={() => handleCardPress(item)}
            />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerCopy: {
    flex: 1,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.lg },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    elevation: 4,
  },
  cardTop: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  featuredLabel: {
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: spacing.sm,
  },
  cardFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
