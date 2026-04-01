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
import Mapbox, {
  Camera,
  LineLayer,
  LocationPuck,
  MapView,
  PointAnnotation,
  ShapeSource,
  StyleImport,
} from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '@/components/ui/AppButton';
import { AppSurface } from '@/components/ui/AppSurface';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useRoutes } from '@/contexts/RoutesContext';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import {
  createSearchSessionToken,
  fetchDirectionsOptions,
  retrieveMapboxLocation,
  searchMapboxSuggestions,
  type MapboxSuggestion,
  type RetrievedMapboxLocation,
} from '@/lib/mapbox';
import type { LngLat, RouteOption, RouteStop, StoredRoute } from '@/types/route';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;
if (!accessToken) {
  throw new Error('Missing Mapbox token.');
}
Mapbox.setAccessToken(accessToken);

const defaultCenter: LngLat = [-87.6298, 41.8781];

function formatDistance(distanceMeters: number) {
  const kilometers = distanceMeters / 1000;
  return kilometers >= 10 ? `${kilometers.toFixed(0)} km` : `${kilometers.toFixed(1)} km`;
}

function formatDuration(durationSeconds: number) {
  const totalMinutes = Math.max(1, Math.round(durationSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) {
    return `${totalMinutes} min`;
  }

  if (!minutes) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

export default function CreateRouteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const {
    mapStyle,
    lightPreset,
    is3DEnabled,
    isDarkMapMode,
    isStandardMapStyle,
  } = usePreferences();
  const { addRoute } = useRoutes();
  const { user } = useAuth();

  const sessionTokenRef = useRef(createSearchSessionToken());
  const cameraRef = useRef<Mapbox.Camera>(null);
  const routeTapHandledRef = useRef(false);

  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [pendingStop, setPendingStop] = useState<RetrievedMapboxLocation | null>(null);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [followUser, setFollowUser] = useState(true);
  const [userCoordinate, setUserCoordinate] = useState<LngLat | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const selectedRouteOption =
    selectedRouteIndex !== null ? routeOptions[selectedRouteIndex] ?? null : null;
  const visibleSuggestions = suggestions.slice(0, 5);
  const showSuggestions = suggestionsOpen && suggestions.length > 0;
  const chromeSurface = isDarkMapMode ? theme.colors.mapOverlay : theme.colors.surface;

  const routeStatusText = useMemo(() => {
    if (directionsLoading) {
      return 'Building walking route options.';
    }

    if (selectedRouteOption) {
      return 'A route is selected. Publish it or start the walk now.';
    }

    if (routeOptions.length > 0) {
      return 'Tap one of the visible paths on the map to select it again.';
    }

    if (pendingStop) {
      return 'Add the selected place as a stop to keep building the route.';
    }

    return 'Search for places and add at least two stops to generate paths.';
  }, [directionsLoading, pendingStop, routeOptions.length, selectedRouteOption]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const setupLocation = async () => {
      try {
        const permissionResult = await Location.requestForegroundPermissionsAsync();
        if (permissionResult.status !== 'granted') {
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setUserCoordinate([
          currentLocation.coords.longitude,
          currentLocation.coords.latitude,
        ]);

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,
          },
          (location) => {
            setUserCoordinate([location.coords.longitude, location.coords.latitude]);
          },
        );
      } catch (error) {
        console.error('Unable to initialize user location', error);
      }
    };

    void setupLocation();

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

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
          userCoordinate ?? undefined,
        );

        if (!cancelled) {
          setSuggestions(nextSuggestions);
          setSuggestionsOpen(nextSuggestions.length > 0);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to search for route stops', error);
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
  }, [searchFocused, searchQuery, userCoordinate]);

  useEffect(() => {
    if (stops.length < 2) {
      setRouteOptions([]);
      setSelectedRouteIndex(null);
      setDirectionsLoading(false);
      return;
    }

    let cancelled = false;

    const loadDirections = async () => {
      try {
        setDirectionsLoading(true);
        const options = await fetchDirectionsOptions(
          stops.map((stop) => stop.coordinate),
          'walking',
        );

        if (cancelled) {
          return;
        }

        setRouteOptions(options);

        if (!options.length) {
          setSelectedRouteIndex(null);
          return;
        }

        setSelectedRouteIndex((previous) => {
          if (previous === null || previous >= options.length) {
            return 0;
          }
          return previous;
        });
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to build directions', error);
          setRouteOptions([]);
          setSelectedRouteIndex(null);
        }
      } finally {
        if (!cancelled) {
          setDirectionsLoading(false);
        }
      }
    };

    void loadDirections();

    return () => {
      cancelled = true;
    };
  }, [stops]);

  const dismissSearchResults = () => {
    Keyboard.dismiss();
    setSearchFocused(false);
    setSuggestionsOpen(false);
  };

  const handleSuggestionPress = async (suggestion: MapboxSuggestion) => {
    try {
      setSelectionLoading(true);
      const place = await retrieveMapboxLocation(
        suggestion.mapboxId,
        sessionTokenRef.current,
      );

      setPendingStop(place);
      setSuggestions([]);
      setSuggestionsOpen(false);
      setSearchFocused(false);
      setSearchQuery(place.fullAddress);
      setFollowUser(false);
      Keyboard.dismiss();

      cameraRef.current?.setCamera({
        centerCoordinate: place.coordinate,
        zoomLevel: 14,
        animationDuration: 700,
      });
    } catch (error) {
      console.error('Failed to retrieve location details for stop', error);
      Alert.alert('Location Error', 'Could not open this location. Please try another one.');
    } finally {
      setSelectionLoading(false);
    }
  };

  const handleAddNextStop = () => {
    if (!pendingStop) {
      return;
    }

    const alreadyAdded = stops.some((stop) => stop.mapboxId === pendingStop.mapboxId);
    if (alreadyAdded) {
      Alert.alert('Already Added', 'This stop is already in your route list.');
      return;
    }

    const nextStop: RouteStop = {
      id: `stop-${Date.now()}-${stops.length}`,
      name: pendingStop.name,
      fullAddress: pendingStop.fullAddress,
      mapboxId: pendingStop.mapboxId,
      coordinate: pendingStop.coordinate,
    };

    setStops((previousStops) => [...previousStops, nextStop]);
    setPendingStop(null);
    setSearchQuery('');
    setSuggestions([]);
    setSuggestionsOpen(false);
    setSearchFocused(false);
    sessionTokenRef.current = createSearchSessionToken();
    Keyboard.dismiss();
  };

  const handlePublish = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      Alert.alert('Title Required', 'Add a title before publishing your route.');
      return;
    }

    if (stops.length < 2) {
      Alert.alert('More Stops Needed', 'Add at least two stops to publish a route.');
      return;
    }

    if (selectedRouteIndex === null || !routeOptions[selectedRouteIndex]) {
      Alert.alert('Select a Route', 'Tap one of the displayed routes before publishing.');
      return;
    }

    if (!user) {
      Alert.alert('Not Signed In', 'You must be signed in to publish a route.');
      return;
    }

    setPublishing(true);

    const selectedRoute = routeOptions[selectedRouteIndex];
    const routeData = {
      stops: stops.map((stop) => ({
        name: stop.name,
        fullAddress: stop.fullAddress,
        coordinate: stop.coordinate,
        mapboxId: stop.mapboxId,
      })),
      polyline: selectedRoute.coordinates,
      durationSeconds: selectedRoute.durationSeconds,
      distanceMeters: selectedRoute.distanceMeters,
    };

    const { data, error } = await supabase
      .from('routes')
      .insert({
        creator_id: user.id,
        title: trimmedTitle,
        city: stops[0].fullAddress,
        route_data: routeData,
        is_public: true,
      })
      .select('id, created_at')
      .single();

    if (error) {
      setPublishing(false);
      Alert.alert('Publish Failed', error.message);
      return;
    }

    const newRoute: StoredRoute = {
      id: data.id,
      title: trimmedTitle,
      stops,
      createdAt: data.created_at,
    };

    addRoute(newRoute);
    setPublishing(false);
    router.back();
  };

  const handleStartNavigation = () => {
    if (stops.length < 2) {
      return;
    }

    const coordinates = JSON.stringify(
      stops.map((stop) => ({
        latitude: stop.coordinate[1],
        longitude: stop.coordinate[0],
      })),
    );

    router.push({
      pathname: '/(tabs)/home/tour',
      params: {
        coordinates,
        title: title.trim() || 'Custom route',
      },
    });
  };

  const handleMapPress = () => {
    dismissSearchResults();

    if (followUser) {
      setFollowUser(false);
    }

    if (routeTapHandledRef.current) {
      routeTapHandledRef.current = false;
      return;
    }

    setSelectedRouteIndex(null);
  };

  const removeStop = (stopId: string) => {
    setStops((currentStops) => currentStops.filter((stop) => stop.id !== stopId));
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={mapStyle}
        onPress={handleMapPress}
        onCameraChanged={(event: any) => {
          if (event?.gestures?.isGestureActive && followUser) {
            setFollowUser(false);
          }
        }}
      >
        <Camera
          ref={cameraRef}
          followUserLocation={followUser}
          followZoomLevel={14}
          defaultSettings={{
            centerCoordinate: userCoordinate ?? defaultCenter,
            zoomLevel: userCoordinate ? 14 : 10,
          }}
        />

        {isStandardMapStyle ? (
          <StyleImport
            id="basemap"
            existing
            config={{
              lightPreset: lightPreset as any,
              // @ts-ignore
              show3dObjects: is3DEnabled,
            }}
          />
        ) : null}

        <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />

        {routeOptions.map((routeOption, index) => {
          const isSelected = selectedRouteIndex === index;
          return (
            <ShapeSource
              id={`new-route-option-${index}`}
              key={routeOption.id}
              shape={{
                type: 'Feature',
                properties: { routeOptionId: routeOption.id },
                geometry: {
                  type: 'LineString',
                  coordinates: routeOption.coordinates,
                },
              } as any}
              onPress={() => {
                routeTapHandledRef.current = true;
                setTimeout(() => {
                  routeTapHandledRef.current = false;
                }, 0);
                dismissSearchResults();
                setSelectedRouteIndex(index);
              }}
            >
              <LineLayer
                id={`new-route-line-${index}`}
                style={{
                  lineColor: isSelected ? theme.colors.textPrimary : theme.colors.accent,
                  lineWidth: isSelected ? 6 : 4,
                  lineOpacity: isSelected ? 0.92 : 0.5,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </ShapeSource>
          );
        })}

        {stops.map((stop, index) => (
          <PointAnnotation key={stop.id} id={stop.id} coordinate={stop.coordinate}>
            <View style={styles.stopMarker}>
              <AppText variant="mono" color={theme.colors.textInverse}>
                {index + 1}
              </AppText>
            </View>
          </PointAnnotation>
        ))}

        {pendingStop ? (
          <PointAnnotation id="pending-stop" coordinate={pendingStop.coordinate}>
            <View style={styles.pendingMarker}>
              <Ionicons name="add" size={14} color={theme.colors.textInverse} />
            </View>
          </PointAnnotation>
        ) : null}
      </MapView>

      <View style={[styles.topBar, { top: insets.top + theme.spacing.xs }]}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.textPrimary} />
          <AccentLine active={false} />
        </Pressable>

        <AppSurface style={[styles.titleShell, { backgroundColor: chromeSurface }]}>
          <View style={styles.titleRow}>
            <AppText variant="label">Route title</AppText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Name this route"
              placeholderTextColor={theme.colors.textMuted}
              selectionColor={theme.colors.accent}
              style={styles.titleInput}
            />
          </View>
        </AppSurface>
      </View>

      {!followUser ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setFollowUser(true)}
          style={[styles.recenterButton, { bottom: insets.bottom + 360 }]}
        >
          <Ionicons name="locate-outline" size={18} color={theme.colors.textPrimary} />
          <AccentLine active />
        </Pressable>
      ) : null}

      <View style={[styles.bottomComposer, { bottom: insets.bottom + theme.spacing.sm }]}>
        <AppSurface style={[styles.composerSurface, { backgroundColor: chromeSurface }]}>
          <View style={styles.composerHeader}>
            <View>
              <AppText variant="label">Route builder</AppText>
              <AppText variant="sectionTitle" style={styles.composerTitle}>
                Build the walk one stop at a time.
              </AppText>
            </View>
            <AppText variant="mono">{routeOptions.length} options</AppText>
          </View>

          <View style={styles.searchShell}>
            <View style={styles.inlineInput}>
              <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={(nextQuery) => {
                  setSearchQuery(nextQuery);
                  setSearchFocused(true);

                  if (pendingStop && nextQuery !== pendingStop.fullAddress) {
                    setPendingStop(null);
                  }

                  if (nextQuery.trim().length < 2) {
                    setSuggestions([]);
                    setSuggestionsOpen(false);
                  }
                }}
                onFocus={() => {
                  setSearchFocused(true);
                  if (searchQuery.trim().length >= 2 && suggestions.length > 0) {
                    setSuggestionsOpen(true);
                  }
                }}
                placeholder="Search for your next stop"
                placeholderTextColor={theme.colors.textMuted}
                selectionColor={theme.colors.accent}
                style={styles.searchInput}
              />
              {(searchLoading || selectionLoading) ? (
                <ActivityIndicator size="small" color={theme.colors.accent} />
              ) : null}
              <AccentLine active={searchFocused} />
            </View>

            <AppButton
              label="Add"
              onPress={handleAddNextStop}
              disabled={!pendingStop}
              style={styles.addButton}
            />
          </View>

          {showSuggestions ? (
            <AppSurface style={styles.suggestionsSurface}>
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
                  <View style={styles.suggestionCopy}>
                    <AppText variant="title">{suggestion.name}</AppText>
                    <AppText variant="caption">{suggestion.fullAddress}</AppText>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.textMuted} />
                </Pressable>
              ))}
            </AppSurface>
          ) : null}

          <View style={styles.pendingRow}>
            <View style={styles.pendingCopy}>
              <AppText variant="label">{pendingStop ? 'Ready to add' : 'Waiting for a place'}</AppText>
              <AppText variant="bodyStrong">
                {pendingStop ? pendingStop.name : 'Choose a search result and add it as a stop.'}
              </AppText>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <AppText variant="label">Stops</AppText>
              <AppText variant="title">{stops.length}</AppText>
            </View>
            <View style={styles.metricItem}>
              <AppText variant="label">Distance</AppText>
              <AppText variant="title">
                {selectedRouteOption ? formatDistance(selectedRouteOption.distanceMeters) : '—'}
              </AppText>
            </View>
            <View style={styles.metricItem}>
              <AppText variant="label">Duration</AppText>
              <AppText variant="title">
                {selectedRouteOption ? formatDuration(selectedRouteOption.durationSeconds) : '—'}
              </AppText>
            </View>
          </View>

          <AppText variant="caption" style={styles.statusText}>
            {routeStatusText}
          </AppText>

          {stops.length > 0 ? (
            <View style={styles.stopList}>
              {stops.map((stop, index) => (
                <View key={stop.id} style={styles.stopRow}>
                  <View style={styles.stopIndex}>
                    <AppText variant="mono" color={theme.colors.textInverse}>
                      {index + 1}
                    </AppText>
                  </View>
                  <View style={styles.stopContent}>
                    <AppText variant="title" numberOfLines={1}>
                      {stop.name}
                    </AppText>
                    <AppText variant="caption" numberOfLines={1}>
                      {stop.fullAddress}
                    </AppText>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => removeStop(stop.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close" size={16} color={theme.colors.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <AppButton
              label="Publish"
              onPress={handlePublish}
              loading={publishing}
              style={styles.actionButton}
            />
            {selectedRouteOption ? (
              <AppButton
                label="Start"
                variant="secondary"
                onPress={handleStartNavigation}
                style={styles.actionButton}
              />
            ) : null}
          </View>
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
    map: {
      flex: 1,
    },
    topBar: {
      position: 'absolute',
      left: theme.spacing.sm,
      right: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.mapOverlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleShell: {
      flex: 1,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.mapOverlay,
    },
    titleRow: {
      gap: 6,
    },
    titleInput: {
      color: theme.colors.textPrimary,
      fontFamily: 'Manrope_600SemiBold',
      fontSize: 16,
      lineHeight: 20,
      paddingVertical: 2,
    },
    recenterButton: {
      position: 'absolute',
      right: theme.spacing.sm,
      width: 44,
      height: 44,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.mapOverlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomComposer: {
      position: 'absolute',
      left: theme.spacing.sm,
      right: theme.spacing.sm,
    },
    composerSurface: {
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.mapOverlay,
    },
    composerHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    composerTitle: {
      marginTop: 4,
    },
    searchShell: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    inlineInput: {
      flex: 1,
      minHeight: 52,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      position: 'relative',
    },
    searchInput: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontFamily: 'Manrope_400Regular',
      fontSize: 15,
      lineHeight: 20,
      paddingVertical: 12,
    },
    addButton: {
      minWidth: 96,
    },
    suggestionsSurface: {
      marginBottom: theme.spacing.xs,
      overflow: 'hidden',
    },
    suggestionRow: {
      minHeight: 64,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    suggestionCopy: {
      flex: 1,
      gap: 4,
      paddingRight: theme.spacing.sm,
    },
    pendingRow: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    pendingCopy: {
      gap: 6,
    },
    metricRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    metricItem: {
      flex: 1,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.xs,
      gap: 6,
    },
    statusText: {
      marginBottom: theme.spacing.sm,
    },
    stopList: {
      maxHeight: 180,
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    stopRow: {
      minHeight: 64,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    stopIndex: {
      width: 28,
      height: 28,
      backgroundColor: theme.colors.surfaceInverse,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stopContent: {
      flex: 1,
      gap: 2,
    },
    removeButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionRow: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    actionButton: {
      flex: 1,
    },
    stopMarker: {
      width: 28,
      height: 28,
      backgroundColor: theme.colors.surfaceInverse,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.surface,
    },
    pendingMarker: {
      width: 28,
      height: 28,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.surface,
    },
  });
