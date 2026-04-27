import Mapbox, {
  Camera,
  CircleLayer,
  Images,
  LineLayer,
  LocationPuck,
  MapView,
  ShapeSource,
  StyleImport,
  SymbolLayer,
} from '@rnmapbox/maps';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMapOrnamentBottomOffset } from '@/constants/navigation';
import { useTheme } from '@/constants/theme';
import { usePreferences } from '../../contexts/PreferencesContext';
import type { LngLat, RoutePin, RoutePreview } from '@/types/route';

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;
if (!accessToken) {
  throw new Error('Missing Mapbox token.');
}
Mapbox.setAccessToken(accessToken);

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = 188;
const MIN_PITCH = 0;
const MAX_PITCH = 85;
const DEFAULT_PITCH = 0;

interface MapProps {
  routePreviews?: RoutePreview[];
  routePins?: RoutePin[];
  selectedRouteId?: string | null;
  onSelectRoute?: (routeId: string | null) => void;
  onPressRoutePin?: (routeId: string) => void;
  highlightedCoordinate?: LngLat | null;
  onMapPress?: () => void;
}

export type MapHandle = {
  getVisibleBounds: () => Promise<[LngLat, LngLat] | null>;
};

type ShapeSourcePressEvent = {
  features: GeoJSON.Feature[];
};

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

function Map(
  {
    routePreviews = [],
    routePins = [],
    selectedRouteId = null,
    onSelectRoute,
    onPressRoutePin,
    highlightedCoordinate = null,
    onMapPress,
  }: MapProps,
  ref: React.Ref<MapHandle>,
) {
  const { mapStyle, lightPreset, is3DEnabled, isDarkMapMode, isStandardMapStyle } = usePreferences();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const mapViewRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const mapOrnamentBottomOffset = getMapOrnamentBottomOffset(insets.bottom);

  useImperativeHandle(
    ref,
    () => ({
      getVisibleBounds: async () => {
        try {
          const bounds = await mapViewRef.current?.getVisibleBounds();
          return (bounds as [LngLat, LngLat] | undefined) ?? null;
        } catch {
          return null;
        }
      },
    }),
    [],
  );
  const [pitch, setPitch] = useState<number>(DEFAULT_PITCH);
  const [followUser, setFollowUser] = useState(true);
  const routePressHandledRef = useRef(false);

  const disableFollowUser = useCallback(() => {
    setFollowUser(false);
  }, []);

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
  const routePinColors = useMemo(
    () => ({
      glow: isDarkMapMode ? 'rgba(251, 146, 60, 0.24)' : 'rgba(217, 119, 87, 0.14)',
      fill: isDarkMapMode ? '#f97316' : theme.accent,
      stroke: isDarkMapMode ? '#fff7ed' : '#ffffff',
      iconOpacity: isDarkMapMode ? 1 : 0.96,
    }),
    [isDarkMapMode, theme],
  );
  const routeLineColors = useMemo(
    () =>
      isDarkMapMode
        ? {
            casing: 'rgba(15, 23, 42, 0.88)',
            selected: '#fff7ed',
            selectedOpacity: 0.98,
            unselected: '#fdba74',
            unselectedOpacity: 0.82,
          }
        : {
            casing: 'rgba(255, 255, 255, 0.94)',
            selected: '#1d4ed8',
            selectedOpacity: 0.94,
            unselected: '#38bdf8',
            unselectedOpacity: 0.72,
          },
    [isDarkMapMode],
  );
  const routePinCollection = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: routePins.map((routePin) => ({
        type: 'Feature',
        id: routePin.routeId,
        properties: {
          routeId: routePin.routeId,
          title: routePin.title,
        },
        geometry: {
          type: 'Point',
          coordinates: routePin.coordinate,
        },
      })),
    }),
    [routePins],
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

    disableFollowUser();
    cameraRef.current?.setCamera({
      centerCoordinate: highlightedCoordinate,
      zoomLevel: 14,
      animationDuration: 700,
    });
  }, [disableFollowUser, highlightedCoordinate]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startYRef.current = knobYRef.current;
        disableFollowUser();
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
    disableFollowUser();

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

  const handleRoutePinPress = (routeId: string) => {
    routePressHandledRef.current = true;
    setTimeout(() => {
      routePressHandledRef.current = false;
    }, 0);

    onMapPress?.();
    onSelectRoute?.(null);
    onPressRoutePin?.(routeId);
  };

  const handleRoutePinSourcePress = (event: ShapeSourcePressEvent) => {
    const pressedFeature = event.features.find(
      (feature) => typeof feature?.properties?.routeId === 'string',
    );
    const pressedRouteId = pressedFeature?.properties?.routeId;

    if (typeof pressedRouteId === 'string') {
      handleRoutePinPress(pressedRouteId);
    }
  };

  const activeTrackHeight = SLIDER_HEIGHT - pitchToY(pitch);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        style={styles.map}
        styleURL={mapStyle}
        logoPosition={{ bottom: mapOrnamentBottomOffset, left: 12 }}
        attributionPosition={{ bottom: mapOrnamentBottomOffset, right: 12 }}
        scaleBarEnabled={false}
        onPress={handleMapPress}
        onTouchStart={disableFollowUser}
        onCameraChanged={(event: any) => {
          if (event?.gestures?.isGestureActive) {
            disableFollowUser();
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

        <Images
          images={{
            routePinMapIcon: require('../../assets/images/route-pin-map-icon.png'),
          }}
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
                id={`route-line-casing-${routePreview.routeId}`}
                style={{
                  lineColor: routeLineColors.casing,
                  lineWidth: isSelected ? 9 : 7,
                  lineOpacity: isDarkMapMode ? 0.82 : 0.9,
                  lineCap: 'round',
                  lineJoin: 'round',
                  lineSortKey: index,
                }}
              />
              <LineLayer
                id={`route-line-${routePreview.routeId}`}
                style={{
                  lineColor: isSelected ? routeLineColors.selected : routeLineColors.unselected,
                  lineWidth: isSelected ? 6.5 : 4.5,
                  lineOpacity: isSelected
                    ? routeLineColors.selectedOpacity
                    : routeLineColors.unselectedOpacity,
                  lineCap: 'round',
                  lineJoin: 'round',
                  lineBlur: isDarkMapMode ? 0.18 : 0.06,
                  lineSortKey: index,
                }}
              />
            </ShapeSource>
          );
        })}

        {routePinCollection.features.length > 0 ? (
          <ShapeSource
            id="route-pins-source"
            shape={routePinCollection}
            onPress={handleRoutePinSourcePress}
            hitbox={{ width: 44, height: 44 }}
          >
            <CircleLayer
              id="route-pin-glow"
              style={{
                circleRadius: 16,
                circleColor: routePinColors.glow,
              }}
            />
            <CircleLayer
              id="route-pin-outer"
              style={{
                circleRadius: 12,
                circleColor: routePinColors.fill,
                circleStrokeColor: routePinColors.stroke,
                circleStrokeWidth: 2.5,
                circleOpacity: 0.98,
              }}
            />
            <SymbolLayer
              id="route-pin-icon"
              style={{
                iconImage: 'routePinMapIcon',
                iconSize: 0.34,
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
                iconOpacity: routePinColors.iconOpacity,
              }}
            />
          </ShapeSource>
        ) : null}
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

export default forwardRef<MapHandle, MapProps>(Map);

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
