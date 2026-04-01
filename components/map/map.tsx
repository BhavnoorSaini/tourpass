import Mapbox, {
  Camera,
  LineLayer,
  LocationPuck,
  MapView,
  ShapeSource,
  StyleImport,
} from '@rnmapbox/maps';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppText } from '@/components/ui/AppText';
import { AccentLine } from '@/components/ui/AccentLine';
import { usePreferences } from '@/contexts/PreferencesContext';
import type { LngLat, RoutePreview } from '@/types/route';
import { useAppTheme, useThemedStyles } from '@/providers/AppThemeProvider';

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;
if (!accessToken) {
  throw new Error('Missing Mapbox token.');
}
Mapbox.setAccessToken(accessToken);

const { height: screenHeight } = Dimensions.get('window');
const sliderHeight = 188;
const minPitch = 0;
const maxPitch = 85;

interface MapProps {
  routePreviews?: RoutePreview[];
  selectedRouteId?: string | null;
  onSelectRoute?: (routeId: string | null) => void;
  highlightedCoordinate?: LngLat | null;
  onMapPress?: () => void;
}

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  return true;
};

function pitchToY(pitch: number) {
  const ratio = (pitch - minPitch) / (maxPitch - minPitch);
  return sliderHeight - ratio * sliderHeight;
}

function yToPitch(y: number) {
  const clamped = Math.max(0, Math.min(sliderHeight, y));
  const ratio = (sliderHeight - clamped) / sliderHeight;
  const pitch = minPitch + ratio * (maxPitch - minPitch);
  return Math.round(pitch * 10) / 10;
}

export default function Map({
  routePreviews = [],
  selectedRouteId = null,
  onSelectRoute,
  highlightedCoordinate = null,
  onMapPress,
}: MapProps) {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const {
    mapStyle,
    lightPreset,
    is3DEnabled,
    isStandardMapStyle,
  } = usePreferences();

  const cameraRef = useRef<Mapbox.Camera>(null);
  const [pitch, setPitch] = useState(0);
  const [followUser, setFollowUser] = useState(true);
  const routePressHandledRef = useRef(false);
  const knobAnim = useRef(new Animated.Value(pitchToY(pitch))).current;
  const knobYRef = useRef(pitchToY(pitch));
  const startYRef = useRef(0);

  useEffect(() => {
    void requestLocationPermission();
  }, []);

  useEffect(() => {
    knobAnim.setValue(pitchToY(pitch));
    knobYRef.current = pitchToY(pitch);
  }, [knobAnim, pitch]);

  useEffect(() => {
    if (!highlightedCoordinate) {
      return;
    }

    setFollowUser(false);
    cameraRef.current?.setCamera({
      centerCoordinate: highlightedCoordinate,
      zoomLevel: 14,
      animationDuration: 700,
    });
  }, [highlightedCoordinate]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startYRef.current = knobYRef.current;
        if (followUser) {
          setFollowUser(false);
        }
      },
      onPanResponderMove: (_event, gestureState) => {
        const nextY = Math.max(
          0,
          Math.min(sliderHeight, startYRef.current + gestureState.dy),
        );
        knobAnim.setValue(nextY);
        knobYRef.current = nextY;
        setPitch(yToPitch(nextY));
      },
    }),
  ).current;

  const handleMapPress = () => {
    if (followUser) {
      setFollowUser(false);
    }

    if (routePressHandledRef.current) {
      routePressHandledRef.current = false;
      return;
    }

    onMapPress?.();
    onSelectRoute?.(null);
  };

  const handleRoutePress = (routeId: string) => {
    routePressHandledRef.current = true;
    setTimeout(() => {
      routePressHandledRef.current = false;
    }, 0);

    onMapPress?.();
    onSelectRoute?.(routeId);
  };

  const activeTrackHeight = sliderHeight - pitchToY(pitch);

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
          pitch={pitch}
          followZoomLevel={15}
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

        {routePreviews.map((routePreview, index) => {
          const isSelected = routePreview.routeId === selectedRouteId;

          return (
            <ShapeSource
              id={`route-source-${routePreview.routeId}`}
              key={routePreview.routeId}
              shape={{
                type: 'Feature',
                properties: { routeId: routePreview.routeId },
                geometry: {
                  type: 'LineString',
                  coordinates: routePreview.coordinates,
                },
              } as any}
              onPress={() => handleRoutePress(routePreview.routeId)}
            >
              <LineLayer
                id={`route-line-${routePreview.routeId}`}
                style={{
                  lineColor: isSelected ? theme.colors.textPrimary : theme.colors.accent,
                  lineWidth: isSelected ? 6 : 4,
                  lineOpacity: isSelected ? 0.9 : 0.54,
                  lineCap: 'round',
                  lineJoin: 'round',
                  lineSortKey: index,
                }}
              />
            </ShapeSource>
          );
        })}
      </MapView>

      <View style={styles.sliderContainer} pointerEvents="box-none">
        <View style={styles.sliderShell}>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { height: activeTrackHeight }]} />
            <Animated.View
              style={[
                styles.knob,
                {
                  transform: [{ translateY: knobAnim }],
                },
              ]}
              {...panResponder.panHandlers}
            />
          </View>
        </View>

        <View style={styles.pitchBadge}>
          <AppText variant="mono" color={theme.colors.textPrimary}>
            {Math.round(pitch)}°
          </AppText>
        </View>
      </View>

      {!followUser ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setFollowUser(true)}
          style={styles.recenterButton}
        >
          <MaterialIcons name="my-location" size={18} color={theme.colors.textPrimary} />
          <AccentLine active inset={10} />
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    sliderContainer: {
      position: 'absolute',
      right: 12,
      top: (screenHeight - sliderHeight) / 2 - 12,
      alignItems: 'center',
    },
    sliderShell: {
      width: 44,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.mapOverlay,
    },
    sliderTrack: {
      height: sliderHeight,
      width: 6,
      backgroundColor: theme.colors.border,
      overflow: 'visible',
    },
    sliderFill: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.accent,
    },
    knob: {
      position: 'absolute',
      left: -9,
      width: 24,
      height: 24,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
    },
    pitchBadge: {
      minWidth: 44,
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.mapOverlay,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 6,
    },
    recenterButton: {
      position: 'absolute',
      right: 12,
      bottom: 120,
      width: 44,
      height: 44,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.mapOverlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
