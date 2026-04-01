import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Map from '@/components/map/map';
import { AppButton } from '@/components/ui/AppButton';
import { AppSurface } from '@/components/ui/AppSurface';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { useRoutes } from '@/contexts/RoutesContext';
import {
  createSearchSessionToken,
  fetchDirectionsOptions,
  retrieveMapboxLocation,
  searchMapboxSuggestions,
  type MapboxSuggestion,
} from '@/lib/mapbox';
import type { LngLat, RoutePreview } from '@/types/route';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
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
  const showSuggestions = suggestionsOpen && visibleSuggestions.length > 0;

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

    void buildRoutePreviews();

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
    }, 260);

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

      <View style={[styles.topChrome, { top: insets.top + theme.spacing.xs }]}>
        <AppText variant="eyebrow">Tourpass</AppText>

        <AppSurface style={styles.searchShell}>
          <View style={styles.searchRow}>
            <Ionicons
              name="search-outline"
              size={18}
              color={searchFocused ? theme.colors.textPrimary : theme.colors.textMuted}
            />
            <TextInput
              value={query}
              onChangeText={(nextQuery) => {
                setQuery(nextQuery);
                setSearchFocused(true);

                if (nextQuery.trim().length < 2) {
                  setSuggestions([]);
                  setSuggestionsOpen(false);
                }
              }}
              onFocus={() => {
                setSearchFocused(true);
                if (query.trim().length >= 2 && suggestions.length > 0) {
                  setSuggestionsOpen(true);
                }
              }}
              placeholder="Search a place"
              placeholderTextColor={theme.colors.textMuted}
              selectionColor={theme.colors.accent}
              style={styles.searchInput}
            />

            {(searchLoading || resolvingSelection) ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/(tabs)/home/create-route')}
              style={styles.createButton}
            >
              <Ionicons name="add" size={18} color={theme.colors.textPrimary} />
              <AccentLine active />
            </Pressable>
          </View>

          <AccentLine active={searchFocused} />
        </AppSurface>

        {showSuggestions ? (
          <AppSurface style={styles.suggestionShell}>
            {visibleSuggestions.map((suggestion, index) => (
              <Pressable
                key={suggestion.mapboxId}
                accessibilityRole="button"
                onPress={() => {
                  void handleSuggestionPress(suggestion);
                }}
                style={[
                  styles.suggestionRow,
                  index < visibleSuggestions.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.suggestionText}>
                  <AppText variant="title">{suggestion.name}</AppText>
                  <AppText variant="caption">{suggestion.fullAddress}</AppText>
                </View>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.textMuted} />
              </Pressable>
            ))}
          </AppSurface>
        ) : null}
      </View>

      <View style={[styles.bottomChrome, { bottom: insets.bottom + theme.spacing.sm }]}>
        <AppSurface style={styles.bottomPanel}>
          <View style={styles.bottomHeader}>
            <View>
              <AppText variant="label">Workspace</AppText>
              <AppText variant="sectionTitle" style={styles.bottomTitle}>
                {selectedRoute ? selectedRoute.title : 'Choose a saved route'}
              </AppText>
            </View>
            <AppText variant="mono">{routes.length} saved</AppText>
          </View>

          {selectedRoute ? (
            <>
              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <AppText variant="label">Stops</AppText>
                  <AppText variant="title">{selectedRoute.stops.length}</AppText>
                </View>
                <View style={styles.metricItem}>
                  <AppText variant="label">Created</AppText>
                  <AppText variant="title">
                    {new Date(selectedRoute.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </AppText>
                </View>
              </View>

              <View style={styles.routeActions}>
                <AppButton
                  label="Start walk"
                  onPress={handleStartNavigation}
                  style={styles.actionButton}
                />
                <AppButton
                  label="Clear"
                  variant="secondary"
                  onPress={() => setSelectedRouteId(null)}
                  style={styles.actionButton}
                />
              </View>
            </>
          ) : (
            <>
              <AppText variant="body" style={styles.emptyCopy}>
                Search the map, preview saved routes, or create a new walk from scratch.
              </AppText>
              <AppButton
                label="Create route"
                onPress={() => router.push('/(tabs)/home/create-route')}
                style={styles.singleAction}
              />
            </>
          )}
        </AppSurface>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    topChrome: {
      position: 'absolute',
      left: theme.spacing.sm,
      right: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    searchShell: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.mapOverlay,
    },
    searchRow: {
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
      paddingVertical: 10,
    },
    createButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.border,
      position: 'relative',
    },
    suggestionShell: {
      backgroundColor: theme.colors.mapOverlay,
      overflow: 'hidden',
    },
    suggestionRow: {
      minHeight: 68,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    suggestionText: {
      flex: 1,
      paddingRight: theme.spacing.sm,
      gap: 4,
    },
    bottomChrome: {
      position: 'absolute',
      left: theme.spacing.sm,
      right: theme.spacing.sm,
    },
    bottomPanel: {
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.mapOverlay,
    },
    bottomHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    bottomTitle: {
      marginTop: 4,
    },
    metricRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    metricItem: {
      flex: 1,
      paddingTop: theme.spacing.xs,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 6,
    },
    routeActions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    actionButton: {
      flex: 1,
    },
    emptyCopy: {
      marginBottom: theme.spacing.sm,
    },
    singleAction: {
      alignSelf: 'flex-start',
      minWidth: 180,
    },
  });
