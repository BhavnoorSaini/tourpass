import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

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
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

function formatDistance(meters: number) {
  const km = meters / 1000;
  return km >= 10 ? `${km.toFixed(0)} km` : `${km.toFixed(1)} km`;
}

function formatDuration(seconds: number) {
  const total = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (!hours) return `${total} min`;
  if (!minutes) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

function RouteCard({ route }: { route: RouteRow }) {
  const stopCount = route.route_data?.stops?.length ?? 0;
  const duration = route.route_data?.durationSeconds;
  const distance = route.route_data?.distanceMeters;
  const guideFirst = route.profiles?.first_name ?? '';
  const guideLast = route.profiles?.last_name ?? '';
  const guideName = [guideFirst, guideLast].filter(Boolean).join(' ') || 'Unknown Guide';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{route.title}</Text>
        <View style={styles.cityBadge}>
          <Text style={styles.cityBadgeText} numberOfLines={1}>{route.city}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        {duration != null && (
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>{formatDuration(duration)}</Text>
          </View>
        )}
        {distance != null && (
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>{formatDistance(distance)}</Text>
          </View>
        )}
        <View style={styles.metaPill}>
          <Text style={styles.metaPillText}>{stopCount} stop{stopCount !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {route.description ? (
        <Text style={styles.description} numberOfLines={2}>{route.description}</Text>
      ) : null}

      <Text style={styles.guideText}>By {guideName}</Text>
    </View>
  );
}

export default function ExploreRoutesScreen() {
  const insets = useSafeAreaInsets();
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('routes')
        .select('id, title, description, city, is_public, created_at, route_data, profiles(first_name, last_name)')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setRoutes((data as RouteRow[]) ?? []);
      }

      setLoading(false);
    };

    fetchRoutes();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Routes</Text>
        <Text style={styles.headerSubtitle}>Discover tours created by guides</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#320e4f" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : routes.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No routes published yet.</Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RouteCard route={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  cityBadge: {
    backgroundColor: '#ede9fe',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    maxWidth: 140,
  },
  cityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6d28d9',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  metaPill: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 8,
  },
  guideText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 4,
  },
});
