import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import { border, useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;
if (!accessToken) throw new Error('Missing Mapbox token.');
Mapbox.setAccessToken(accessToken);

const DEFAULT_CENTER: LngLat = [-87.6298, 41.8781];

function formatDistance(m: number) {
  const km = m / 1000;
  return km >= 10 ? `${km.toFixed(0)} km` : `${km.toFixed(1)} km`;
}
function formatDuration(s: number) {
  const total = Math.max(1, Math.round(s / 60));
  const h = Math.floor(total / 60), m = total % 60;
  if (!h) return `${total} min`;
  if (!m) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export default function CreateRouteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mapStyle, lightPreset, is3DEnabled, isStandardMapStyle } = usePreferences();
  const { addRoute } = useRoutes();
  const { user } = useAuth();
  const theme = useTheme();

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

  const routeStatusText = useMemo(() => {
    if (directionsLoading) return 'Finding paths…';
    if (selectedRouteOption) return `${formatDistance(selectedRouteOption.distanceMeters)} · ${formatDuration(selectedRouteOption.durationSeconds)}`;
    if (routeOptions.length > 0) return 'Select a path on the map';
    if (pendingStop) return 'Add at least 2 stops';
    return 'Search for a place to begin';
  }, [directionsLoading, pendingStop, routeOptions.length, selectedRouteOption]);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    const init = async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserCoordinate([loc.coords.longitude, loc.coords.latitude]);
        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
          (l) => setUserCoordinate([l.coords.longitude, l.coords.latitude]),
        );
      } catch (e) { console.error('Location init failed', e); }
    };
    init();
    return () => { sub?.remove(); };
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
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
  }, [searchQuery, searchFocused]);

  useEffect(() => {
    if (stops.length < 2) { setRouteOptions([]); setSelectedRouteIndex(null); return; }
    let cancelled = false;
    const fetch = async () => {
      setDirectionsLoading(true);
      try {
        const opts = await fetchDirectionsOptions(stops.map((s) => s.coordinate), 'walking');
        if (!cancelled) { setRouteOptions(opts); setSelectedRouteIndex(null); }
      } catch (e) {
        if (!cancelled) { console.error('Directions failed', e); setRouteOptions([]); }
      } finally { if (!cancelled) setDirectionsLoading(false); }
    };
    fetch();
    return () => { cancelled = true; };
  }, [stops]);

  const dismissSearchResults = () => {
    Keyboard.dismiss(); setSearchFocused(false); setSuggestionsOpen(false);
  };

  const handleSearchChange = (v: string) => {
    setSearchQuery(v); setSearchFocused(true);
    if (v.trim().length < 2) { setSuggestions([]); setSuggestionsOpen(false); }
  };

  const handleSuggestionPress = async (suggestion: MapboxSuggestion) => {
    try {
      setSelectionLoading(true);
      const place = await retrieveMapboxLocation(suggestion.mapboxId, sessionTokenRef.current);
      setPendingStop(place);
      setSearchQuery(place.name);
      setSuggestions([]); setSuggestionsOpen(false); setSearchFocused(false);
      Keyboard.dismiss();
      sessionTokenRef.current = createSearchSessionToken();
      cameraRef.current?.setCamera({ centerCoordinate: place.coordinate, zoomLevel: 14, animationDuration: 700 });
    } catch {
      Alert.alert('Location Error', 'Could not open this location.');
    } finally { setSelectionLoading(false); }
  };

  const handleAddNextStop = () => {
    if (!pendingStop) return;
    if (stops.some((s) => s.mapboxId === pendingStop.mapboxId)) {
      Alert.alert('Already Added', 'Stop already in route.'); return;
    }
    setStops((prev) => [
      ...prev,
      {
        id: `stop-${Date.now()}`,
        name: pendingStop.name,
        fullAddress: pendingStop.fullAddress,
        mapboxId: pendingStop.mapboxId,
        coordinate: pendingStop.coordinate,
      },
    ]);
    setPendingStop(null); setSearchQuery(''); setSuggestions([]);
    setSuggestionsOpen(false); setSearchFocused(false);
    sessionTokenRef.current = createSearchSessionToken();
    Keyboard.dismiss();
  };

  const handlePublish = async () => {
    if (!title.trim()) { Alert.alert('Title Required', 'Enter a title.'); return; }
    if (stops.length < 2) { Alert.alert('More Stops', 'Add at least 2 stops.'); return; }
    if (selectedRouteIndex === null) { Alert.alert('Select Path', 'Tap a path on the map.'); return; }
    if (!user) return;

    setPublishing(true);
    const selected = routeOptions[selectedRouteIndex];
    const routeData = {
      stops: stops.map((s) => ({ name: s.name, fullAddress: s.fullAddress, coordinate: s.coordinate, mapboxId: s.mapboxId })),
      polyline: selected.coordinates,
      durationSeconds: selected.durationSeconds,
      distanceMeters: selected.distanceMeters,
    };

    const { data, error } = await supabase.from('routes').insert({
      creator_id: user.id, title: title.trim(), city: stops[0].fullAddress,
      route_data: routeData, is_public: true,
    }).select('id, created_at').single();

    if (error) { setPublishing(false); Alert.alert('Error', error.message); return; }

    addRoute({ id: data.id, title: title.trim(), stops, createdAt: data.created_at } as StoredRoute);
    setPublishing(false);
    router.back();
  };

  const handleStartNavigation = () => {
    if (stops.length < 2) return;
    router.push({
      pathname: '/(tabs)/home/tour',
      params: {
        coordinates: JSON.stringify(stops.map((s) => ({ latitude: s.coordinate[1], longitude: s.coordinate[0] }))),
        title: title.trim(),
      },
    });
  };

  const handleMapPress = () => {
    dismissSearchResults();
    if (followUser) setFollowUser(false);
    if (routeTapHandledRef.current) { routeTapHandledRef.current = false; return; }
    setSelectedRouteIndex(null);
  };

  const overlayBg = theme.overlayBackground;

  return (
    <View style={styles.root}>
      <MapView
        style={styles.map}
        styleURL={mapStyle}
        onPress={handleMapPress}
        onCameraChanged={(e: any) => {
          if (e?.gestures?.isGestureActive && followUser) setFollowUser(false);
        }}
      >
        <Camera
          ref={cameraRef}
          followUserLocation={followUser}
          followZoomLevel={14}
          defaultSettings={{ centerCoordinate: userCoordinate ?? DEFAULT_CENTER, zoomLevel: userCoordinate ? 14 : 10 }}
        />
        {isStandardMapStyle && (
          <StyleImport id="basemap" existing config={{ lightPreset: lightPreset as any, show3dObjects: is3DEnabled ? 'true' : 'false' }} />
        )}
        <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />

        {routeOptions.map((opt, i) => {
          const sel = selectedRouteIndex === i;
          return (
            <ShapeSource
              key={opt.id}
              id={`route-opt-${i}`}
              shape={{ type: 'Feature', properties: { id: opt.id }, geometry: { type: 'LineString', coordinates: opt.coordinates } } as any}
              onPress={() => {
                routeTapHandledRef.current = true;
                setTimeout(() => { routeTapHandledRef.current = false; }, 0);
                dismissSearchResults(); setSelectedRouteIndex(i);
              }}
            >
              <LineLayer
                id={`route-line-${i}`}
                style={{ lineColor: sel ? theme.accent : theme.textTertiary, lineWidth: sel ? 6 : 4, lineOpacity: sel ? 1 : 0.4, lineCap: 'round', lineJoin: 'round' }}
              />
            </ShapeSource>
          );
        })}

        {stops.map((stop, i) => (
          <PointAnnotation key={stop.id} id={stop.id} coordinate={stop.coordinate}>
            <View style={[styles.stopMarker, { backgroundColor: theme.accent, borderColor: 'white', borderWidth: 2 }]}>
              <Text style={[typography.labelS, { color: theme.accentText, fontSize: 10 }]}>{i + 1}</Text>
            </View>
          </PointAnnotation>
        ))}
      </MapView>

      <View style={[styles.topBar, { top: insets.top + spacing.md }]}>
        <View style={[styles.integratedBar, { backgroundColor: overlayBg }]}>
          <Pressable 
            onPress={() => router.back()} 
            style={styles.inlineBackBtn}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </Pressable>
          <View style={styles.barDivider} />
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Name your route"
            placeholderTextColor={theme.textSecondary}
            style={[typography.bodyM, { color: theme.text, flex: 1, paddingVertical: 0, paddingHorizontal: spacing.xs }]}
          />
        </View>
      </View>

      {!followUser && (
        <Pressable
          onPress={() => setFollowUser(true)}
          style={[styles.recenterBtn, { bottom: insets.bottom + 380, backgroundColor: overlayBg }]}
        >
          <Ionicons name="locate" size={20} color={theme.text} />
        </Pressable>
      )}

      <View style={[styles.composer, { bottom: insets.bottom + spacing.lg, backgroundColor: overlayBg }]}>
        <View style={styles.composerHeader}>
          <View>
            <Text style={[typography.labelS, { color: theme.accent, letterSpacing: 1.5, fontWeight: '700' }]}>BUILDER</Text>
            <Text style={[typography.headingS, { color: theme.text, marginTop: 4 }]}>{routeStatusText}</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={[styles.searchField, { backgroundColor: theme.background }]}>
            <Ionicons name="search" size={16} color={theme.textSecondary} style={{ marginRight: spacing.sm }} />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search for a stop"
              placeholderTextColor={theme.textSecondary}
              style={[typography.bodyM, { color: theme.text, flex: 1, paddingVertical: 0 }]}
              autoCorrect={false}
            />
            {(searchLoading || selectionLoading) && <ActivityIndicator size="small" color={theme.accent} />}
          </View>
          <Pressable
            onPress={handleAddNextStop}
            disabled={!pendingStop}
            style={[styles.addBtn, { backgroundColor: pendingStop ? theme.accent : theme.surfaceRaised }]}
          >
            <Ionicons name="add" size={22} color={pendingStop ? theme.accentText : theme.textSecondary} />
          </Pressable>
        </View>

        {shouldShowSuggestions && (
          <View style={[styles.suggestions, { backgroundColor: theme.surface }]}>
            {visibleSuggestions.map((s, i) => (
              <Pressable key={s.mapboxId} onPress={() => handleSuggestionPress(s)} style={styles.suggItem}>
                <Text style={[typography.bodyM, { color: theme.text }]} numberOfLines={1}>{s.name}</Text>
                <Text style={[typography.bodyS, { color: theme.textSecondary, fontSize: 12, marginTop: 2 }]} numberOfLines={1}>{s.fullAddress}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {stops.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stopsScroll} contentContainerStyle={styles.stopsContent}>
            {stops.map((stop, i) => (
              <View key={stop.id} style={[styles.stopChip, { backgroundColor: theme.background }]}>
                <Text style={[typography.labelS, { color: theme.textSecondary, marginRight: 6 }]}>{i + 1}</Text>
                <Text style={[typography.bodyS, { color: theme.text, marginRight: 8 }]} numberOfLines={1}>{stop.name}</Text>
                <Pressable onPress={() => setStops(s => s.filter((_, idx) => idx !== i))}>
                  <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.actions}>
          <Pressable 
            onPress={handlePublish} 
            disabled={publishing || stops.length < 2 || selectedRouteIndex === null}
            style={[styles.actionBtn, { backgroundColor: theme.surface }]}
          >
            <Text style={[typography.buttonM, { color: theme.text }]}>Publish</Text>
          </Pressable>
          <Pressable 
            onPress={handleStartNavigation} 
            disabled={stops.length < 2}
            style={[styles.actionBtn, { backgroundColor: theme.accent }]}
          >
            <Ionicons name="navigate" size={18} color={theme.accentText} style={{ marginRight: 8 }} />
            <Text style={[typography.buttonM, { color: theme.accentText }]}>Navigate</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map: { flex: 1 },
  topBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
  integratedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  inlineBackBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: spacing.xs,
  },
  recenterBtn: {
    position: 'absolute',
    right: spacing.lg,
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  composer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  composerHeader: { marginBottom: spacing.lg },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchField: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestions: {
    borderRadius: radius.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggItem: {
    padding: spacing.md,
    borderRadius: radius.md,
  },
  stopsScroll: { marginBottom: spacing.lg },
  stopsContent: { gap: spacing.sm, paddingRight: spacing.xl },
  stopChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 40,
    borderRadius: radius.full,
  },
  actions: { flexDirection: 'row', gap: spacing.md },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
