import Mapbox, { MapView, Camera, LocationPuck, StyleImport } from '@rnmapbox/maps';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { usePreferences } from '../../contexts/PreferencesContext';

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;
if (!accessToken) {
  throw new Error('Missing Mapbox token.');
}
Mapbox.setAccessToken(accessToken);

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDER_HEIGHT = 220;
const SLIDER_WIDTH = 44;
const MIN_PITCH = 0;
const MAX_PITCH = 85;

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

export default function Map() {
  const { mapStyle, lightPreset, is3DEnabled } = usePreferences();

  const cameraRef = useRef<Mapbox.Camera>(null);
  const [pitch, setPitch] = useState<number>(45);
  const [followUser, setFollowUser] = useState(true);

  const knobAnim = useRef(new Animated.Value(pitchToY(pitch))).current;
  const knobYRef = useRef<number>(pitchToY(pitch));
  const startYRef = useRef<number>(0);

  useEffect(() => {
    requestLocationPermission();
    knobAnim.setValue(pitchToY(pitch));
    knobYRef.current = pitchToY(pitch);
  }, [knobAnim, pitch]);

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
          const newPitch = yToPitch(newY);
          setPitch(newPitch);
        },
        onPanResponderRelease: () => {},
      }),
  ).current;

  return (
      <View style={styles.container}>
        <MapView
            style={styles.map}
            styleURL={mapStyle}
            onPress={() => {
              if (followUser) {
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

          {/* Mapbox Standard Settings (Handles both Lighting and 3D!) */}
          {mapStyle.includes('standard') && (
              <StyleImport
                  id="basemap"
                  existing
                  config={{
                    lightPreset: lightPreset as any,
                    // @ts-ignore
                    show3dObjects: is3DEnabled,
                  }}
              />
          )}

          <LocationPuck
              puckBearingEnabled
              puckBearing="heading"
              pulsing={{ isEnabled: true }}
          />
        </MapView>

        <View style={styles.sliderContainer} pointerEvents="box-none">
          <View style={styles.sliderTrack}>
            <Animated.View
                style={[
                  styles.knob,
                  {
                    transform: [
                      {
                        translateY: knobAnim,
                      },
                    ],
                  },
                ]}
                {...panResponder.panHandlers}
            />
          </View>
          <View style={styles.pitchLabel}>
            <Text style={styles.pitchText}>{pitch}°</Text>
          </View>
        </View>
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
    top: (SCREEN_HEIGHT - SLIDER_HEIGHT) / 2,
    height: SLIDER_HEIGHT + 24,
    width: SLIDER_WIDTH,
    alignItems: 'center',
  },
  sliderTrack: {
    height: SLIDER_HEIGHT,
    width: 6,
    backgroundColor: '#ddd',
    borderRadius: 3,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  knob: {
    position: 'absolute',
    left: -10,
    width: 36,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#999',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pitchLabel: {
    marginTop: 8,
    alignItems: 'center',
  },
  pitchText: {
    fontSize: 12,
    color: '#111',
  },
});