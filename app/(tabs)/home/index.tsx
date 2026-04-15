import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Map from '@/components/map/map';
import { useRoutes } from '@/contexts/RoutesContext';
import {
  createSearchSessionToken,
  fetchDirectionsOptions,
  retrieveMapboxLocation,
  searchMapboxSuggestions,
  type MapboxSuggestion,
} from '@/lib/mapbox';
import type { LngLat, RoutePreview } from '@/types/route';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { routes } = useRoutes();

  const sessionTokenRef = useRef(createSearchSessionToken());

  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [resolvingSelection, setResolvingSelection] = useState(false);
  const [highlightedCoordinate, setHighlightedCoordinate] = useState<LngLat | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routePreviews, setRoutePreviews] = useState<RoutePreview[]>([]);
  const [startPressed, setStartPressed] = useState(false);

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId) ?? null,
    [routes, selectedRouteId],
  );
  const visibleSuggestions = suggestions.slice(0, 6);
  const shouldShowSuggestions = suggestionsOpen && visibleSuggestions.length > 0;

  useEffect(() => {
    if (!selectedRouteId) return;
    if (!routes.some((r) => r.id === selectedRouteId)) setSelectedRouteId(null);
  }, [routes, selectedRouteId]);

  useEffect(() => {
    let cancelled = false;
    const build = async () => {
      if (!routes.length) { setRoutePreviews([]); return; }
      const results = await Promise.all(
        routes.map(async (route) => {
          if (route.stops.length < 2) return null;
          try {
            const options = await fetchDirectionsOptions(route.stops.map((s) => s.coordinate), 'walking');
            const first = options[0];
            if (!first?.coordinates?.length) return null;
            return { routeId: route.id, coordinates: first.coordinates } satisfies RoutePreview;
          } catch { return null; }
        }),
      );
      if (!cancelled) setRoutePreviews(results.filter((p): p is RoutePreview => p !== null));
    };
    build();
    return () => { cancelled = true; };
  }, [routes]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 || !searchFocused) {
      setSuggestions([]); setSuggestionsOpen(false); setSearchLoading(false); return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const next = await searchMapboxSuggestions(trimmed, sessionTokenRef.current);
        if (!cancelled) { setSuggestions(next); setSuggestionsOpen(next.length > 0); }
      } catch { if (!cancelled) { setSuggestions([]); setSuggestionsOpen(false); } }
      finally { if (!cancelled) setSearchLoading(false); }
    }, 280);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, searchFocused]);

  const collapseSearch = () => {
    Keyboard.dismiss(); setSearchFocused(false); setSuggestionsOpen(false);
  };

  const handleSuggestionPress = async (s: MapboxSuggestion) => {
    try {
      setResolvingSelection(true);
      const place = await retrieveMapboxLocation(s.mapboxId, sessionTokenRef.current);
      setQuery(place.fullAddress);
      setHighlightedCoordinate(place.coordinate);
      setSuggestions([]); setSuggestionsOpen(false); setSearchFocused(false);
      Keyboard.dismiss();
      sessionTokenRef.current = createSearchSessionToken();
    } catch {
      Alert.alert('Location Error', 'Could not open location.');
    } finally { setResolvingSelection(false); }
  };

  const handleStartNavigation = () => {
    if (!selectedRouteId) return;
    router.push({ pathname: '/(tabs)/home/tour', params: { routeId: selectedRouteId } });
  };

  const overlayBg = theme.overlayBackground;
  const topOffset = insets.top + spacing.md;

  return (
    <View style={styles.container}>
      <Map
        routePreviews={routePreviews}
        selectedRouteId={selectedRouteId}
        onSelectRoute={setSelectedRouteId}
        highlightedCoordinate={highlightedCoordinate}
        onMapPress={collapseSearch}
      />

      {/* ── Search bar ── */}
      <View style={[styles.topOverlay, { top: topOffset }]}>
        <View style={[styles.searchRow, { backgroundColor: overlayBg }]}>
          <Ionicons name="search-outline" size={16} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={(v) => {
              setQuery(v); setSearchFocused(true);
              if (v.trim().length < 2) { setSuggestions([]); setSuggestionsOpen(false); }
            }}
            onFocus={() => {
              setSearchFocused(true);
              if (query.trim().length >= 2 && suggestions.length > 0) setSuggestionsOpen(true);
            }}
            placeholder="Search places"
            placeholderTextColor={theme.textSecondary}
            style={[typography.bodyM, styles.searchInput, { color: theme.text }]}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {(searchLoading || resolvingSelection) && (
            <ActivityIndicator size="small" color={theme.accent} style={styles.searchSpinner} />
          )}
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)/home/create-route')}
          style={[styles.addButton, { backgroundColor: theme.accent }]}
        >
          <Ionicons name="add" size={24} color={theme.accentText} />
        </Pressable>
      </View>

      {/* ── Suggestions ── */}
      {shouldShowSuggestions && (
        <View style={[styles.suggestions, { top: topOffset + 56 + spacing.sm, backgroundColor: overlayBg }]}>
          {visibleSuggestions.map((s, i) => (
            <Pressable
              key={s.mapboxId}
              onPress={() => handleSuggestionPress(s)}
              style={[
                styles.suggestionRow,
                i < visibleSuggestions.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.background },
              ]}
            >
              <Text style={[typography.bodyM, { color: theme.text }]}>{s.name}</Text>
              <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 1 }]} numberOfLines={1}>{s.fullAddress}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* ── Route hint ── */}
      {routePreviews.length > 0 && !selectedRoute && (
        <View style={[styles.hint, { backgroundColor: theme.accent }]}>
          <Text style={[typography.labelS, { color: theme.accentText }]}>
            Select a route to begin
          </Text>
        </View>
      )}

      {/* ── Custom tour request button ── */}
      {!selectedRoute && (
        <Pressable
          onPress={() => router.push('/(tabs)/home/custom-route-request' as never)}
          style={[styles.customRouteButton, { backgroundColor: overlayBg }]}
        >
          <Ionicons name="sparkles-outline" size={18} color={theme.accent} />
          <Text
            style={[
              typography.buttonM,
              { color: theme.text, marginLeft: spacing.xs },
            ]}
          >
            Request Custom Tour
          </Text>
        </Pressable>
      )}

      {/* ── Selected route panel ── */}
      {selectedRoute && (
        <View style={[styles.startPanel, { backgroundColor: overlayBg }]}>
          <View style={styles.startPanelContent}>
            <Text style={[typography.headingS, { color: theme.text }]}>
              {selectedRoute.title}
            </Text>
            <Text style={[typography.bodyS, { color: theme.textSecondary, marginTop: 2 }]}>
              {selectedRoute.stops.length} stops
            </Text>
          </View>
          <Pressable
            onPress={handleStartNavigation}
            onPressIn={() => setStartPressed(true)}
            onPressOut={() => setStartPressed(false)}
            style={[
              styles.startButton,
              {
                backgroundColor: theme.accent,
                opacity: startPressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="navigate" size={16} color={theme.accentText} />
            <Text style={[typography.buttonM, { color: theme.accentText, marginLeft: spacing.xs }]}>
              Start
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topOverlay: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchRow: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: { marginRight: spacing.xs },
  searchInput: { flex: 1, paddingVertical: 0 },
  searchSpinner: { marginLeft: spacing.xs },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  suggestions: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  hint: {
    position: 'absolute',
    bottom: 72 + spacing.lg + 56,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  customRouteButton: {
    position: 'absolute',
    bottom: 72 + spacing.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  startPanel: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 72 + spacing.lg,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  startPanelContent: { flex: 1 },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
});
