import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
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

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;
if (!accessToken) {
  throw new Error('Missing Mapbox token.');
}
Mapbox.setAccessToken(accessToken);

const DEFAULT_CENTER: LngLat = [-87.6298, 41.8781];

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
  const { mapStyle, lightPreset, is3DEnabled, isDarkMapMode, isStandardMapStyle } = usePreferences();
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
  const shouldShowSuggestions = suggestionsOpen && suggestions.length > 0;
  const blurTint = isDarkMapMode ? 'dark' : 'light';
  const chromeColors = useMemo(
    () =>
      isDarkMapMode
        ? {
            glassBorder: 'rgba(148,163,184,0.32)',
            glassSurface: 'rgba(2,6,23,0.48)',
            glassPanel: 'rgba(2,6,23,0.58)',
            softSurface: 'rgba(15,23,42,0.72)',
            softSurfaceStrong: 'rgba(15,23,42,0.9)',
            softSurfaceMuted: 'rgba(15,23,42,0.6)',
            textPrimary: '#e2e8f0',
            textSecondary: '#94a3b8',
            accent: '#7dd3fc',
            accentStrong: '#38bdf8',
            accentSoft: 'rgba(56,189,248,0.18)',
            statusAccent: '#5eead4',
            iconColor: '#e2e8f0',
            placeholder: '#94a3b8',
          }
        : {
            glassBorder: 'rgba(255,255,255,0.52)',
            glassSurface: 'rgba(248,250,252,0.4)',
            glassPanel: 'rgba(248,250,252,0.48)',
            softSurface: 'rgba(255,255,255,0.72)',
            softSurfaceStrong: 'rgba(248,250,252,0.92)',
            softSurfaceMuted: 'rgba(255,255,255,0.62)',
            textPrimary: '#0f172a',
            textSecondary: '#475569',
            accent: '#2563eb',
            accentStrong: '#2563eb',
            accentSoft: 'rgba(37,99,235,0.12)',
            statusAccent: '#0f766e',
            iconColor: '#0f172a',
            placeholder: '#64748b',
          },
    [isDarkMapMode],
  );

  const routeStatusText = useMemo(() => {
    if (directionsLoading) {
      return 'Building walking route options...';
    }

    if (selectedRouteOption) {
      return 'Selected route is ready. Tap the map to clear it or start navigation.';
    }

    if (routeOptions.length > 0) {
      return 'Route cleared. Tap a highlighted path to reselect it.';
    }

    if (pendingStop) {
      return 'Add this stop to generate route options once you have at least two stops.';
    }

    return 'Search for places and add at least 2 stops to build your route.';
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

    setupLocation();

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
    }, 280);

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

    loadDirections();

    return () => {
      cancelled = true;
    };
  }, [stops]);

  const dismissSearchResults = () => {
    Keyboard.dismiss();
    setSearchFocused(false);
    setSuggestionsOpen(false);
  };

  const handleSearchChange = (nextQuery: string) => {
    setSearchQuery(nextQuery);
    setSearchFocused(true);

    if (pendingStop && nextQuery !== pendingStop.fullAddress) {
      setPendingStop(null);
    }

    if (nextQuery.trim().length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
    }
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
      Alert.alert('More Stops Needed', 'Add at least 2 stops to publish a route.');
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

    const { data, error } = await supabase.from('routes').insert({
      creator_id: user.id,
      title: trimmedTitle,
      city: stops[0].fullAddress,
      route_data: routeData,
      is_public: true,
    }).select('id, created_at').single();

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

  const headerTop = insets.top + 12;
  const composerBottom = Math.max(insets.bottom + 18, 28);

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
            centerCoordinate: userCoordinate ?? DEFAULT_CENTER,
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

        <LocationPuck
          puckBearingEnabled
          puckBearing="heading"
          pulsing={{ isEnabled: true }}
        />

        {routeOptions.map((routeOption, index) => {
          const isSelected = selectedRouteIndex === index;
          return (
            <ShapeSource
              id={`new-route-option-${index}`}
              key={routeOption.id}
              shape={{
                type: 'Feature',
                properties: {
                  routeOptionId: routeOption.id,
                },
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
                  lineColor: isSelected ? '#0f766e' : '#38bdf8',
                  lineWidth: isSelected ? 7 : 4.5,
                  lineOpacity: isSelected ? 0.96 : 0.5,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </ShapeSource>
          );
        })}

        {stops.map((stop, index) => (
          <PointAnnotation
            key={stop.id}
            id={stop.id}
            coordinate={stop.coordinate}
          >
            <View style={styles.stopMarker}>
              <Text style={styles.stopMarkerText}>{index + 1}</Text>
            </View>
          </PointAnnotation>
        ))}

        {pendingStop && (
          <PointAnnotation
            id="pending-stop"
            coordinate={pendingStop.coordinate}
          >
            <View style={styles.pendingMarker}>
              <MaterialIcons name="add" size={14} color="#ffffff" />
            </View>
          </PointAnnotation>
        )}
      </MapView>

      <View style={[styles.headerRow, { top: headerTop }]}>
        <View
          style={[
            styles.iconChrome,
            {
              borderColor: chromeColors.glassBorder,
              backgroundColor: chromeColors.glassSurface,
            },
          ]}
        >
          <BlurView intensity={50} tint={blurTint} style={styles.blurFill}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
              activeOpacity={0.88}
            >
              <MaterialIcons name="arrow-back-ios-new" size={18} color={chromeColors.iconColor} />
            </TouchableOpacity>
          </BlurView>
        </View>

        <View
          style={[
            styles.titleChrome,
            {
              borderColor: chromeColors.glassBorder,
              backgroundColor: chromeColors.glassSurface,
            },
          ]}
        >
          <BlurView intensity={60} tint={blurTint} style={styles.blurFill}>
            <View style={styles.titleInputRow}>
              <MaterialIcons name="route" size={18} color={chromeColors.accentStrong} />
              <TextInput
                value={title}
                onChangeText={setTitle}
                onFocus={() => {
                  setSearchFocused(false);
                  setSuggestionsOpen(false);
                }}
                placeholder="Route title"
                placeholderTextColor={chromeColors.placeholder}
                style={[
                  styles.titleInput,
                  {
                    color: chromeColors.textPrimary,
                  },
                ]}
              />
            </View>
          </BlurView>
        </View>
      </View>

      {!followUser && (
        <TouchableOpacity
          style={[
            styles.recenterButton,
            {
              bottom: composerBottom + 312,
              backgroundColor: chromeColors.softSurfaceStrong,
            },
          ]}
          onPress={() => setFollowUser(true)}
          activeOpacity={0.88}
        >
          <MaterialIcons name="my-location" size={20} color={chromeColors.iconColor} />
        </TouchableOpacity>
      )}

      <View style={[styles.composerWrap, { bottom: composerBottom }]}>
        <View
          style={[
            styles.composerChrome,
            {
              borderColor: chromeColors.glassBorder,
              backgroundColor: chromeColors.glassPanel,
            },
          ]}
        >
          <BlurView intensity={68} tint={blurTint} style={styles.blurFill}>
            <View style={styles.composer}>
              <View style={styles.composerHeader}>
                <View>
                  <Text
                    style={[
                      styles.composerEyebrow,
                      {
                        color: chromeColors.accentStrong,
                      },
                    ]}
                  >
                    Route Builder
                  </Text>
                  <Text
                    style={[
                      styles.composerTitle,
                      {
                        color: chromeColors.textPrimary,
                      },
                    ]}
                  >
                    Shape the walk as you go
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: chromeColors.softSurfaceMuted,
                    },
                  ]}
                >
                  <MaterialIcons name="alt-route" size={14} color={chromeColors.statusAccent} />
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color: chromeColors.textPrimary,
                      },
                    ]}
                  >
                    {routeOptions.length || 0} routes
                  </Text>
                </View>
              </View>

              <View style={styles.searchRow}>
                <View
                  style={[
                    styles.searchField,
                    {
                      backgroundColor: chromeColors.softSurface,
                    },
                  ]}
                >
                  <MaterialIcons name="search" size={18} color={chromeColors.textSecondary} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    onFocus={() => {
                      setSearchFocused(true);
                      if (searchQuery.trim().length >= 2 && suggestions.length > 0) {
                        setSuggestionsOpen(true);
                      }
                    }}
                    placeholder="Search for your next stop"
                    placeholderTextColor={chromeColors.placeholder}
                    style={[
                      styles.searchInput,
                      {
                        color: chromeColors.textPrimary,
                      },
                    ]}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  {(searchLoading || selectionLoading) && (
                    <ActivityIndicator size="small" color="#2563eb" />
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.addStopButton,
                    !pendingStop ? styles.addStopButtonDisabled : null,
                  ]}
                  disabled={!pendingStop}
                  onPress={handleAddNextStop}
                  activeOpacity={0.88}
                >
                  <MaterialIcons name="add" size={18} color="#ffffff" />
                  <Text style={styles.addStopButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {shouldShowSuggestions && (
                <View
                  style={[
                    styles.suggestionsPanel,
                    {
                      backgroundColor: chromeColors.softSurface,
                    },
                  ]}
                >
                  {visibleSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={suggestion.mapboxId}
                      style={[
                        styles.suggestionRow,
                        {
                          borderBottomColor: chromeColors.glassBorder,
                        },
                        index === visibleSuggestions.length - 1 ? styles.suggestionRowLast : null,
                      ]}
                      onPress={() => handleSuggestionPress(suggestion)}
                      activeOpacity={0.82}
                    >
                      <View
                        style={[
                          styles.suggestionIconWrap,
                          {
                            backgroundColor: chromeColors.accentSoft,
                          },
                        ]}
                      >
                        <MaterialIcons name="place" size={15} color={chromeColors.accentStrong} />
                      </View>
                      <View style={styles.suggestionCopy}>
                        <Text
                          style={[
                            styles.suggestionTitle,
                            {
                              color: chromeColors.textPrimary,
                            },
                          ]}
                        >
                          {suggestion.name}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.suggestionSubtitle,
                            {
                              color: chromeColors.textSecondary,
                            },
                          ]}
                        >
                          {suggestion.fullAddress}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View
                style={[
                  styles.pendingCard,
                  {
                    backgroundColor: chromeColors.softSurfaceMuted,
                  },
                ]}
              >
                <View
                  style={[
                    styles.pendingIconWrap,
                    {
                      backgroundColor: chromeColors.accentSoft,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={pendingStop ? 'flag' : 'travel-explore'}
                    size={16}
                    color={chromeColors.statusAccent}
                  />
                </View>
                <View style={styles.pendingCopy}>
                  <Text
                    style={[
                      styles.pendingLabel,
                      {
                        color: chromeColors.statusAccent,
                      },
                    ]}
                  >
                    {pendingStop ? 'Ready to add' : 'No stop selected yet'}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.pendingValue,
                      {
                        color: chromeColors.textPrimary,
                      },
                    ]}
                  >
                    {pendingStop ? pendingStop.name : 'Choose a place from the search results.'}
                  </Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View
                  style={[
                    styles.metricPill,
                    {
                      backgroundColor: chromeColors.softSurfaceMuted,
                    },
                  ]}
                >
                  <MaterialIcons name="room" size={14} color={chromeColors.accentStrong} />
                  <Text
                    style={[
                      styles.metricPillText,
                      {
                        color: chromeColors.textPrimary,
                      },
                    ]}
                  >
                    {stops.length} stops
                  </Text>
                </View>

                {selectedRouteOption && (
                  <>
                    <View
                      style={[
                        styles.metricPill,
                        {
                          backgroundColor: chromeColors.softSurfaceMuted,
                        },
                      ]}
                    >
                      <MaterialIcons name="straighten" size={14} color={chromeColors.accentStrong} />
                      <Text
                        style={[
                          styles.metricPillText,
                          {
                            color: chromeColors.textPrimary,
                          },
                        ]}
                      >
                        {formatDistance(selectedRouteOption.distanceMeters)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.metricPill,
                        {
                          backgroundColor: chromeColors.softSurfaceMuted,
                        },
                      ]}
                    >
                      <MaterialIcons name="schedule" size={14} color={chromeColors.accentStrong} />
                      <Text
                        style={[
                          styles.metricPillText,
                          {
                            color: chromeColors.textPrimary,
                          },
                        ]}
                      >
                        {formatDuration(selectedRouteOption.durationSeconds)}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              <Text
                style={[
                  styles.routeStatusText,
                  {
                    color: chromeColors.textSecondary,
                  },
                ]}
              >
                {routeStatusText}
              </Text>

              {stops.length > 0 && (
                <View style={styles.stopsSection}>
                  <Text
                    style={[
                      styles.sectionLabel,
                      {
                        color: chromeColors.textSecondary,
                      },
                    ]}
                  >
                    Stops
                  </Text>
                  <ScrollView
                    style={styles.stopsList}
                    contentContainerStyle={styles.stopsListContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {stops.map((stop, index) => (
                      <View
                        style={[
                          styles.stopRow,
                          {
                            backgroundColor: chromeColors.softSurfaceMuted,
                          },
                        ]}
                        key={stop.id}
                      >
                        <View style={styles.stopIndexBubble}>
                          <Text style={styles.stopIndexText}>{index + 1}</Text>
                        </View>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.stopText,
                            {
                              color: chromeColors.textPrimary,
                            },
                          ]}
                        >
                          {stop.name}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.actionRow}>
                {selectedRouteOption && (
                  <TouchableOpacity
                    style={[
                      styles.secondaryAction,
                      {
                        backgroundColor: chromeColors.softSurface,
                      },
                    ]}
                    onPress={handleStartNavigation}
                    activeOpacity={0.88}
                  >
                    <MaterialIcons name="directions-walk" size={18} color={chromeColors.textPrimary} />
                    <Text
                      style={[
                        styles.secondaryActionText,
                        {
                          color: chromeColors.textPrimary,
                        },
                      ]}
                    >
                      Start
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryAction,
                    publishing ? styles.primaryActionDisabled : null,
                  ]}
                  onPress={handlePublish}
                  disabled={publishing}
                  activeOpacity={0.9}
                >
                  {publishing ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <MaterialIcons name="publish" size={18} color="#ffffff" />
                      <Text style={styles.primaryActionText}>Publish</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  map: {
    flex: 1,
  },
  blurFill: {
    flex: 1,
  },
  headerRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconChrome: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.52)',
    backgroundColor: 'rgba(248,250,252,0.4)',
    shadowColor: '#020617',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleChrome: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.52)',
    backgroundColor: 'rgba(248,250,252,0.4)',
    shadowColor: '#020617',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  titleInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 10,
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  recenterButton: {
    position: 'absolute',
    right: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(248,250,252,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#020617',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  composerWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  composerChrome: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.58)',
    backgroundColor: 'rgba(248,250,252,0.48)',
    shadowColor: '#020617',
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 10,
  },
  composer: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  composerEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: '#2563eb',
  },
  composerTitle: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.66)',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  searchField: {
    flex: 1,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  addStopButton: {
    minWidth: 92,
    height: 54,
    borderRadius: 999,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addStopButtonDisabled: {
    backgroundColor: 'rgba(15,23,42,0.42)',
  },
  addStopButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  suggestionsPanel: {
    marginTop: 12,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.76)',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148,163,184,0.36)',
  },
  suggestionRowLast: {
    borderBottomWidth: 0,
  },
  suggestionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(37,99,235,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionCopy: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  suggestionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#475569',
  },
  pendingCard: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  pendingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(15,118,110,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCopy: {
    flex: 1,
  },
  pendingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
  },
  pendingValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  metricPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  routeStatusText: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
    fontWeight: '500',
  },
  stopsSection: {
    marginTop: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#475569',
  },
  stopsList: {
    marginTop: 10,
    maxHeight: 120,
  },
  stopsListContent: {
    gap: 8,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  stopIndexBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIndexText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  stopText: {
    flex: 1,
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.76)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  primaryAction: {
    flex: 1.15,
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionDisabled: {
    opacity: 0.72,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  stopMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563eb',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopMarkerText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 11,
  },
  pendingMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0f766e',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
