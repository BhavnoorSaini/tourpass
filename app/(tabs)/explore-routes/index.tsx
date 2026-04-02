import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
    stops: { name: string; fullAddress: string }[];
    durationSeconds: number;
    distanceMeters: number;
  };
  profiles: { first_name: string | null; last_name: string | null }[] | null;
}

function fmt(meters: number) {
  const km = meters / 1000;
  return km >= 10 ? `${km.toFixed(0)} km` : `${km.toFixed(1)} km`;
}
function fmtDur(seconds: number) {
  const total = Math.max(1, Math.round(seconds / 60));
  const h = Math.floor(total / 60), m = total % 60;
  if (!h) return `${total} min`;
  if (!m) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function RouteCard({ route, onPress }: { route: RouteRow; onPress: () => void }) {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);
  const stopCount = route.route_data?.stops?.length ?? 0;
  const dur = route.route_data?.durationSeconds;
  const dist = route.route_data?.distanceMeters;
  const guideFirst = route.profiles?.[0]?.first_name ?? '';
  const guideLast = route.profiles?.[0]?.last_name ?? '';
  const guideName = [guideFirst, guideLast].filter(Boolean).join(' ') || 'Local Guide';

  const metas = [
    dur != null ? fmtDur(dur) : null,
    dist != null ? fmt(dist) : null,
    `${stopCount} stop${stopCount !== 1 ? 's' : ''}`,
  ].filter(Boolean);

  // If title is missing or suspiciously long (like an address), we prioritize readability
  const hasValidTitle = route.title && route.title.trim().length > 0 && !route.title.includes(',');
  const displayTitle = hasValidTitle ? route.title : (route.city?.split(',')[0] || 'Local Tour');
  
  // For the sub-label, use the full city/area
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
          <Text style={[typography.headingM, { color: theme.text }]} numberOfLines={2}>
            {displayTitle}
          </Text>
          <Text style={[typography.labelS, { color: theme.textSecondary, marginTop: 4 }]} numberOfLines={1}>
            {displayCity}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        {metas.map((m, i) => (
          <View key={m} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[typography.bodyS, { color: theme.textSecondary }]}>
              {m}
            </Text>
            {i < metas.length - 1 && <View style={[styles.dot, { backgroundColor: theme.textSecondary, opacity: 0.3 }]} />}
          </View>
        ))}
      </View>

      {route.description ? (
        <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: spacing.xs }]} numberOfLines={2}>
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
  const insets = useSafeAreaInsets();
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true); setError(null);
      const { data, error: err } = await supabase
        .from('routes')
        .select('id, title, description, city, is_public, created_at, route_data, profiles(first_name, last_name)')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (err) setError(err.message);
      else setRoutes((data as unknown as RouteRow[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleCardPress = (route: RouteRow) => {
    Alert.alert(`Request "${route.title}"?`, 'This will notify the guide.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Request', onPress: () => submitRequest(route) },
    ]);
  };

  const submitRequest = async (route: RouteRow) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { Alert.alert('Sign in', 'Please sign in first.'); return; }
    const { error: err } = await supabase.from('tour_requests').insert({ tourist_id: user.id, route_id: route.id, status: 'pending' });
    if (err) { Alert.alert('Failed', err.message); return; }
    Alert.alert('Sent', 'Request submitted!');
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[typography.displayL, { color: theme.text }]}>Explore</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[typography.bodyM, { color: theme.destructive }]}>{error}</Text>
        </View>
      ) : routes.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[typography.bodyM, { color: theme.textSecondary }]}>No routes found.</Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RouteCard route={item} onPress={() => handleCardPress(item)} />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
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
