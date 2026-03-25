import Mapbox, {
  Camera,
  LineLayer,
  LocationPuck,
  MapView,
  ShapeSource,
  StyleImport,
} from '@rnmapbox/maps';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePreferences } from '../../contexts/PreferencesContext';
import type { LngLat, RoutePreview } from '@/types/route';

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;
if (!accessToken) {
  throw new Error('Missing Mapbox token.');
}
Mapbox.setAccessToken(accessToken);

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = 188;
const MIN_PITCH = 0;
const MAX_PITCH = 85;

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
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

function pitchToY(pitch: number) {
  const ratio = (pitch - MIN_PITCH) / (MAX_PITCH - MIN_PITCH);
  return SLIDER_HEIGHT - ratio * SLIDER_HEIGHT;
}

function yToPitch(y: number) {
  const clamped = Math.max(0, Math.min(SLIDER_HEIGHT, y));
  const ratio = (SLIDER_HEIGHT - clamped) / SLIDER_HEIGHT;
  const pitch = MIN_PITCH + ratio * (MAX_PITCH - MIN_PITCH);
  return Math.round(pitch * 10) / 10;
}

export default function Map({
  routePreviews = [],
  selectedRouteId = null,
  onSelectRoute,
  highlightedCoordinate = null,
  onMapPress,
}: MapProps) {
  const { mapStyle, lightPreset, is3DEnabled, isDarkMapMode, isStandardMapStyle } = usePreferences();

  const cameraRef = useRef<Mapbox.Camera>(null);
  const [pitch, setPitch] = useState<number>(0);
  const [followUser, setFollowUser] = useState(true);
  const routePressHandledRef = useRef(false);

  const knobAnim = useRef(new Animated.Value(pitchToY(pitch))).current;
  const knobYRef = useRef<number>(pitchToY(pitch));
  const startYRef = useRef<number>(0);

  const chromeColors = useMemo(
    () =>
      isDarkMapMode
        ? {
            shellBackground: 'rgba(2,6,23,0.5)',
            shellBorder: 'rgba(148,163,184,0.3)',
            trackBackground: 'rgba(148,163,184,0.18)',
            fill: '#38bdf8',
            knobBackground: 'rgba(15,23,42,0.96)',
            knobBorder: 'rgba(148,163,184,0.34)',
            grip: '#7dd3fc',
            badgeBackground: 'rgba(2,6,23,0.86)',
            badgeText: '#e2e8f0',
            iconButtonBackground: 'rgba(2,6,23,0.84)',
            iconColor: '#e2e8f0',
          }
        : {
            shellBackground: 'rgba(248,250,252,0.3)',
            shellBorder: 'rgba(255,255,255,0.46)',
            trackBackground: 'rgba(15,23,42,0.16)',
            fill: '#0ea5e9',
            knobBackground: 'rgba(255,255,255,0.98)',
            knobBorder: 'rgba(255,255,255,0.82)',
            grip: '#0ea5e9',
            badgeBackground: 'rgba(248,250,252,0.86)',
            badgeText: '#0f172a',
            iconButtonBackground: 'rgba(248,250,252,0.92)',
            iconColor: '#0f172a',
          },
    [isDarkMapMode],
  );

  useEffect(() => {
    requestLocationPermission();
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
      onPanResponderMove: (_evt, gestureState) => {
        const newY = Math.max(
          0,
          Math.min(SLIDER_HEIGHT, startYRef.current + gestureState.dy),
        );
        knobAnim.setValue(newY);
        knobYRef.current = newY;
        setPitch(yToPitch(newY));
      },
      onPanResponderRelease: () => {},
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

  const activeTrackHeight = SLIDER_HEIGHT - pitchToY(pitch);

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

        <LocationPuck
          puckBearingEnabled
          puckBearing="heading"
          pulsing={{ isEnabled: true }}
        />

        {routePreviews.map((routePreview, index) => {
          const isSelected = routePreview.routeId === selectedRouteId;
          return (
            <ShapeSource
              id={`route-source-${routePreview.routeId}`}
              key={routePreview.routeId}
              shape={{
                type: 'Feature',
                properties: {
                  routeId: routePreview.routeId,
                },
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
                  lineColor: isSelected ? '#1d4ed8' : '#38bdf8',
                  lineWidth: isSelected ? 7 : 5,
                  lineOpacity: isSelected ? 0.94 : 0.54,
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
        <View
          style={[
            styles.sliderShell,
            {
              backgroundColor: chromeColors.shellBackground,
              borderColor: chromeColors.shellBorder,
            },
          ]}
        >
          <View
            style={[
              styles.sliderTrack,
              {
                backgroundColor: chromeColors.trackBackground,
              },
            ]}
          >
            <View
              style={[
                styles.sliderFill,
                {
                  height: activeTrackHeight,
                  backgroundColor: chromeColors.fill,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.knob,
                {
                  backgroundColor: chromeColors.knobBackground,
                  borderColor: chromeColors.knobBorder,
                  transform: [{ translateY: knobAnim }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <View
                style={[
                  styles.knobGrip,
                  {
                    backgroundColor: chromeColors.grip,
                  },
                ]}
              />
            </Animated.View>
          </View>
        </View>
        <View
          style={[
            styles.pitchBadge,
            {
              backgroundColor: chromeColors.badgeBackground,
            },
          ]}
        >
          <Text
            style={[
              styles.pitchText,
              {
                color: chromeColors.badgeText,
              },
            ]}
          >
            {Math.round(pitch)}°
          </Text>
        </View>
      </View>

      {!followUser && (
        <TouchableOpacity
          style={[
            styles.recenterButton,
            {
              backgroundColor: chromeColors.iconButtonBackground,
            },
          ]}
          onPress={() => {
            setFollowUser(true);
          }}
          activeOpacity={0.88}
        >
          <MaterialIcons name="my-location" size={20} color={chromeColors.iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  sliderContainer: {
    position: 'absolute',
    right: 12,
    top: (SCREEN_HEIGHT - SLIDER_HEIGHT) / 2 - 12,
    alignItems: 'center',
  },
  sliderShell: {
    width: 48,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#020617',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  sliderTrack: {
    height: SLIDER_HEIGHT,
    width: 8,
    borderRadius: 999,
    overflow: 'visible',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
  },
  knob: {
    position: 'absolute',
    left: -11,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    shadowColor: '#020617',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobGrip: {
    width: 11,
    height: 11,
    borderRadius: 999,
  },
  pitchBadge: {
    marginTop: 10,
    minWidth: 48,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#020617',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  pitchText: {
    fontSize: 12,
    fontWeight: '700',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 112,
    right: 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#020617',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
});
