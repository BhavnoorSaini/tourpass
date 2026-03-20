import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Map from '@/components/map/map';
import { useRoutes } from '@/contexts/RoutesContext';
import {
  createSearchSessionToken,
  retrieveMapboxLocation,
  searchMapboxSuggestions,
  type MapboxSuggestion,
} from '@/lib/mapbox';
import type { LngLat } from '@/types/route';

export default function Index() {
  const router = useRouter();
  const { routes } = useRoutes();

  const sessionTokenRef = useRef(createSearchSessionToken());

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [resolvingSelection, setResolvingSelection] = useState(false);
  const [highlightedCoordinate, setHighlightedCoordinate] = useState<LngLat | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? null,
    [routes, selectedRouteId],
  );

  useEffect(() => {
    if (!selectedRouteId) {
      return;
    }

    const routeStillExists = routes.some((route) => route.id === selectedRouteId);
    if (!routeStillExists) {
      setSelectedRouteId(null);
    }
  }, [routes, selectedRouteId]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const nextSuggestions = await searchMapboxSuggestions(
          trimmedQuery,
          sessionTokenRef.current,
        );

        if (!cancelled) {
          setSuggestions(nextSuggestions);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to search places', error);
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const handleSuggestionPress = async (suggestion: MapboxSuggestion) => {
    try {
      setResolvingSelection(true);
      const place = await retrieveMapboxLocation(
        suggestion.mapboxId,
        sessionTokenRef.current,
      );

      setQuery(place.fullAddress);
      setHighlightedCoordinate(place.coordinate);
      setSuggestions([]);
      sessionTokenRef.current = createSearchSessionToken();
    } catch (error) {
      console.error('Failed to retrieve selected place', error);
      Alert.alert('Location Error', 'Could not open that location. Please try another result.');
    } finally {
      setResolvingSelection(false);
    }
  };

  const handleStartNavigation = () => {
    if (!selectedRouteId) {
      return;
    }

    router.push({
      pathname: '/(tabs)/home/tour',
      params: { routeId: selectedRouteId },
    });
  };

  return (
    <View style={styles.container}>
      <Map
        routes={routes}
        selectedRouteId={selectedRouteId}
        onSelectRoute={(routeId) => setSelectedRouteId(routeId)}
        highlightedCoordinate={highlightedCoordinate}
      />

      <View style={styles.topOverlay}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search places with Mapbox"
              placeholderTextColor="#6b7280"
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {(searchLoading || resolvingSelection) && (
              <ActivityIndicator size="small" color="#2563eb" style={styles.searchSpinner} />
            )}
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(tabs)/home/create-route')}
          >
            <Text style={styles.createButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsPanel}>
            {suggestions.slice(0, 6).map((suggestion) => (
              <TouchableOpacity
                key={suggestion.mapboxId}
                style={styles.suggestionRow}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionTitle}>{suggestion.name}</Text>
                <Text numberOfLines={1} style={styles.suggestionSubtitle}>
                  {suggestion.fullAddress}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {routes.length > 0 && !selectedRoute && (
        <View style={styles.helperChip}>
          <Text style={styles.helperChipText}>Tap a route line on the map to select it</Text>
        </View>
      )}

      {selectedRoute && (
        <View style={styles.startPanel}>
          <Text style={styles.routeTitle}>{selectedRoute.title}</Text>
          <Text style={styles.routeMeta}>{selectedRoute.stops.length} stops</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartNavigation}>
            <Text style={styles.startButtonText}>Start Navigation</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInputWrap: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    paddingLeft: 14,
    paddingRight: 38,
    fontSize: 15,
    color: '#111827',
  },
  searchSpinner: {
    position: 'absolute',
    right: 12,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 28,
    marginTop: -3,
    fontWeight: '400',
  },
  suggestionsPanel: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.97)',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
  },
  suggestionRow: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  suggestionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#6b7280',
  },
  helperChip: {
    position: 'absolute',
    bottom: 122,
    left: 16,
    right: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(17,24,39,0.86)',
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  helperChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  startPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 92,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.97)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
  },
  routeTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  routeMeta: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 12,
  },
  startButton: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
