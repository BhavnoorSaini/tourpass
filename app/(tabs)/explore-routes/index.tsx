import {
  memo,
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppSurface } from '@/components/ui/AppSurface';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { supabase } from '@/lib/supabase';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

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
  }[] | null;
}

type FilterKey = 'all' | 'quick' | 'extended' | `city:${string}`;

interface FilterChipOption {
  key: FilterKey;
  label: string;
  count: number;
}

const quickRouteSeconds = 2 * 60 * 60;

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

function getGuideName(route: RouteRow) {
  const guideFirst = route.profiles?.[0]?.first_name ?? '';
  const guideLast = route.profiles?.[0]?.last_name ?? '';
  return [guideFirst, guideLast].filter(Boolean).join(' ') || 'Local Guide';
}

function matchesFilter(route: RouteRow, filter: FilterKey) {
  const duration = route.route_data?.durationSeconds ?? 0;

  if (filter === 'all') {
    return true;
  }

  if (filter === 'quick') {
    return duration > 0 && duration <= quickRouteSeconds;
  }

  if (filter === 'extended') {
    return duration > quickRouteSeconds;
  }

  if (filter.startsWith('city:')) {
    return route.city.trim().toLowerCase() === filter.slice(5).toLowerCase();
  }

  return true;
}

const FilterChip = memo(function FilterChip({
  option,
  active,
  onPress,
}: {
  option: FilterChipOption;
  active: boolean;
  onPress: (value: FilterKey) => void;
}) {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(option.key)}
      style={[
        styles.filterChip,
        active && {
          borderColor: theme.colors.borderStrong,
        },
      ]}
    >
      <AppText
        variant="button"
        color={active ? theme.colors.textPrimary : theme.colors.textMuted}
      >
        {option.label}
      </AppText>
      <AppText variant="mono" color={active ? theme.colors.textPrimary : theme.colors.textMuted}>
        {option.count}
      </AppText>
      <AccentLine active={active} />
    </Pressable>
  );
});

const RouteCard = memo(function RouteCard({
  route,
  onPress,
}: {
  route: RouteRow;
  onPress: (route: RouteRow) => void;
}) {
  const styles = useThemedStyles(createStyles);
  const stopCount = route.route_data?.stops?.length ?? 0;
  const duration = route.route_data?.durationSeconds;
  const distance = route.route_data?.distanceMeters;

  return (
    <Pressable accessibilityRole="button" onPress={() => onPress(route)} style={styles.cardPressable}>
      <AppSurface style={styles.routeCard}>
        <View style={styles.routeCardTop}>
          <View style={styles.cityCode}>
            <AppText variant="mono">{route.city.slice(0, 3).toUpperCase()}</AppText>
          </View>
          <AppText variant="caption" numberOfLines={1}>
            {getGuideName(route)}
          </AppText>
        </View>

        <AppText variant="title" numberOfLines={2} style={styles.routeTitle}>
          {route.title}
        </AppText>
        <AppText variant="caption" numberOfLines={3}>
          {route.description?.trim() || 'A measured local route built for an easy city walk.'}
        </AppText>

        <View style={styles.metricStrip}>
          <AppText variant="mono">{stopCount} stops</AppText>
          <AppText variant="mono">{duration ? formatDuration(duration) : '—'}</AppText>
          <AppText variant="mono">{distance ? formatDistance(distance) : '—'}</AppText>
        </View>
      </AppSurface>
    </Pressable>
  );
});

export default function ExploreRoutesScreen() {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const { theme } = useAppTheme();
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase());

  useEffect(() => {
    let mounted = true;

    const fetchRoutes = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('routes')
        .select('id, title, description, city, is_public, created_at, route_data, profiles(first_name, last_name)')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (!mounted) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setRoutes((data as unknown as RouteRow[]) ?? []);
      }

      setLoading(false);
    };

    void fetchRoutes();

    return () => {
      mounted = false;
    };
  }, []);

  const filterOptions = useMemo<FilterChipOption[]>(() => {
    const cityCounts = routes.reduce<Record<string, number>>((acc, route) => {
      const city = route.city.trim();
      if (!city) return acc;
      acc[city] = (acc[city] ?? 0) + 1;
      return acc;
    }, {});

    const topCities = Object.entries(cityCounts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([city, count]) => ({
        key: `city:${city}` as FilterKey,
        label: city,
        count,
      }));

    return [
      { key: 'all', label: 'All', count: routes.length },
      {
        key: 'quick',
        label: 'Quick',
        count: routes.filter((route) => matchesFilter(route, 'quick')).length,
      },
      {
        key: 'extended',
        label: 'Extended',
        count: routes.filter((route) => matchesFilter(route, 'extended')).length,
      },
      ...topCities,
    ];
  }, [routes]);

  useEffect(() => {
    if (!filterOptions.some((option) => option.key === activeFilter)) {
      setActiveFilter('all');
    }
  }, [activeFilter, filterOptions]);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const searchHaystack = [
        route.title,
        route.description ?? '',
        route.city,
        getGuideName(route),
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = deferredSearchQuery
        ? searchHaystack.includes(deferredSearchQuery)
        : true;

      return matchesSearch && matchesFilter(route, activeFilter);
    });
  }, [activeFilter, deferredSearchQuery, routes]);

  const submitRequest = useCallback(async (route: RouteRow) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Not Signed In', 'You must be signed in to request a tour.');
      return;
    }

    const { error: insertError } = await supabase.from('tour_requests').insert({
      tourist_id: user.id,
      route_id: route.id,
      status: 'pending',
    });

    if (insertError) {
      Alert.alert('Request Failed', insertError.message);
      return;
    }

    Alert.alert('Request Sent', `Your request for "${route.title}" has been submitted.`);
  }, []);

  const handleCardPress = useCallback(
    (route: RouteRow) => {
      Alert.alert(
        'Request this route',
        `Would you like to request "${route.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Request',
            onPress: () => {
              void submitRequest(route);
            },
          },
        ],
      );
    },
    [submitRequest],
  );

  const header = (
    <View style={[styles.headerWrap, { paddingTop: insets.top + theme.spacing.xs }]}>
      <AppText variant="eyebrow">Explore</AppText>
      <AppText variant="display" style={styles.headerTitle}>
        Browse published walks at a calmer pace.
      </AppText>
      <AppText variant="body" style={styles.headerBody}>
        Search by city or guide, then narrow the pace until the route feels right.
      </AppText>

      <AppSurface style={styles.searchShell}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={(value) => {
              startTransition(() => {
                setSearchQuery(value);
              });
            }}
            placeholder="Search route, guide, or city"
            placeholderTextColor={theme.colors.textMuted}
            selectionColor={theme.colors.accent}
            style={styles.searchInput}
          />
        </View>
        <AccentLine active={Boolean(searchQuery)} />
      </AppSurface>

      <FlatList
        data={filterOptions}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <FilterChip
            option={item}
            active={item.key === activeFilter}
            onPress={(value) => {
              startTransition(() => {
                setActiveFilter(value);
              });
            }}
          />
        )}
      />

      <View style={styles.summaryRow}>
        <View style={styles.summaryCell}>
          <AppText variant="label">Visible routes</AppText>
          <AppText variant="sectionTitle">{filteredRoutes.length}</AppText>
        </View>
        <View style={styles.summaryCell}>
          <AppText variant="label">Current filter</AppText>
          <AppText variant="sectionTitle">
            {filterOptions.find((option) => option.key === activeFilter)?.label ?? 'All'}
          </AppText>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={loading || error ? [] : filteredRoutes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RouteCard route={item} onPress={handleCardPress} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color={theme.colors.accent} />
                <AppText variant="sectionTitle">Loading routes</AppText>
              </>
            ) : error ? (
              <>
                <AppText variant="sectionTitle">Could not load routes</AppText>
                <AppText variant="body">{error}</AppText>
              </>
            ) : (
              <>
                <AppText variant="sectionTitle">
                  {routes.length === 0 ? 'No routes published yet' : 'No matching routes'}
                </AppText>
                <AppText variant="body">
                  {routes.length === 0
                    ? 'As soon as guides publish routes, they will appear here.'
                    : 'Try a broader filter or a different city name.'}
                </AppText>
              </>
            )}
          </View>
        }
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={{ paddingBottom: insets.bottom + theme.spacing.xl }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerWrap: {
      paddingHorizontal: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
    },
    headerTitle: {
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
      maxWidth: 320,
    },
    headerBody: {
      maxWidth: 340,
      marginBottom: theme.spacing.md,
    },
    searchShell: {
      paddingHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    searchRow: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontFamily: 'Manrope_400Regular',
      fontSize: 15,
      lineHeight: 20,
      paddingVertical: 12,
    },
    filterList: {
      gap: theme.spacing.xs,
      paddingBottom: theme.spacing.sm,
    },
    filterChip: {
      minHeight: 44,
      minWidth: 84,
      paddingHorizontal: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.xs,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.sm,
    },
    summaryCell: {
      flex: 1,
      gap: 6,
    },
    columnWrap: {
      paddingHorizontal: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    cardPressable: {
      flex: 1,
      marginBottom: theme.spacing.xs,
    },
    routeCard: {
      minHeight: 196,
      padding: theme.spacing.sm,
      justifyContent: 'space-between',
    },
    routeCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    cityCode: {
      minWidth: 44,
      minHeight: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
      paddingHorizontal: theme.spacing.xs,
    },
    routeTitle: {
      marginBottom: theme.spacing.xs,
    },
    metricStrip: {
      marginTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.xs,
      gap: 4,
    },
    emptyState: {
      minHeight: 280,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
  });
