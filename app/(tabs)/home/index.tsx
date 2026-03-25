import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
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
  fetchDirectionsOptions,
  retrieveMapboxLocation,
  searchMapboxSuggestions,
  type MapboxSuggestion,
} from '@/lib/mapbox';
import type { LngLat, RoutePreview } from '@/types/route';

export default function Index() {
  const router = useRouter();
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

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? null,
    [routes, selectedRouteId],
  );
  const visibleSuggestions = suggestions.slice(0, 6);
  const shouldShowSuggestions = suggestionsOpen && visibleSuggestions.length > 0;

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
    let cancelled = false;

    const buildRoutePreviews = async () => {
      if (!routes.length) {
        setRoutePreviews([]);
        return;
      }

      const previewResults = await Promise.all(
        routes.map(async (route) => {
          if (route.stops.length < 2) {
            return null;
          }

          try {
            const options = await fetchDirectionsOptions(
              route.stops.map((stop) => stop.coordinate),
              'walking',
            );

            const firstOption = options[0];
            if (!firstOption?.coordinates?.length) {
              return null;
            }

            return {
              routeId: route.id,
              coordinates: firstOption.coordinates,
            } satisfies RoutePreview;
          } catch (error) {
            console.error('Failed to build saved route preview', error);
            return null;
          }
        }),
      );

      if (!cancelled) {
        setRoutePreviews(
          previewResults.filter((preview): preview is RoutePreview => preview !== null),
        );
      }
    };

    buildRoutePreviews();

    return () => {
      cancelled = true;
    };
  }, [routes]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      setSearchLoading(false);
      return;
    }

    if (!searchFocused) {
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
          setSuggestionsOpen(nextSuggestions.length > 0);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to search places', error);
          setSuggestions([]);
          setSuggestionsOpen(false);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, searchFocused]);

  const collapseSearch = () => {
    Keyboard.dismiss();
    setSearchFocused(false);
    setSuggestionsOpen(false);
  };

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    setSearchFocused(true);

    if (nextQuery.trim().length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
    }
  };

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
      setSuggestionsOpen(false);
      setSearchFocused(false);
      Keyboard.dismiss();
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
        routePreviews={routePreviews}
        selectedRouteId={selectedRouteId}
        onSelectRoute={setSelectedRouteId}
        highlightedCoordinate={highlightedCoordinate}
        onMapPress={collapseSearch}
      />

      <View style={styles.topOverlay}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <TextInput
              value={query}
              onChangeText={handleQueryChange}
              onFocus={() => {
                setSearchFocused(true);
                if (query.trim().length >= 2 && suggestions.length > 0) {
                  setSuggestionsOpen(true);
                }
              }}
              placeholder="Search places with Mapbox"
              placeholderTextColor="#64748b"
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
            activeOpacity={0.9}
          >
            <Text style={styles.createButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {shouldShowSuggestions && (
          <View style={styles.suggestionsPanel}>
            {visibleSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={suggestion.mapboxId}
                style={[
                  styles.suggestionRow,
                  index === visibleSuggestions.length - 1 ? styles.suggestionRowLast : null,
                ]}
                onPress={() => handleSuggestionPress(suggestion)}
                activeOpacity={0.84}
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

      {routePreviews.length > 0 && !selectedRoute && (
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
    gap: 10,
  },
  searchInputWrap: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 20,
    minHeight: 50,
    justifyContent: 'center',
    shadowColor: '#020617',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    paddingLeft: 16,
    paddingRight: 40,
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a',
  },
  searchSpinner: {
    position: 'absolute',
    right: 14,
  },
  createButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#020617',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 28,
    marginTop: -3,
    fontWeight: '400',
  },
  suggestionsPanel: {
    marginTop: 10,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.94)',
    shadowColor: '#020617',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.3)',
  },
  suggestionRowLast: {
    borderBottomWidth: 0,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  suggestionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748b',
  },
  helperChip: {
    position: 'absolute',
    bottom: 122,
    left: 16,
    right: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.82)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  helperChipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  startPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 92,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#020617',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  routeTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  routeMeta: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 12,
  },
  startButton: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: '#0f766e',
    paddingVertical: 13,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
