import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { MapboxNavigationView } from '@badatgil/expo-mapbox-navigation';
import { useRoutes } from '@/contexts/RoutesContext';
import { useAuth } from '@/providers/AuthProvider';
import { recordRouteCompletion } from '@/lib/profile-activity';

interface NavigationCoordinate {
  latitude: number;
  longitude: number;
}

function parseCoordinates(serialized?: string): NavigationCoordinate[] {
  if (!serialized) return [];
  try {
    const parsed = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => typeof item?.latitude === 'number' && typeof item?.longitude === 'number',
    ) as NavigationCoordinate[];
  } catch {
    return [];
  }
}

export default function TourNavigation() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { getRouteById } = useRoutes();
  const { user } = useAuth();
  const completionRecordedRef = useRef(false);

  const routeIdParam = typeof params.routeId === 'string' ? params.routeId : undefined;
  const coordinatesParam = typeof params.coordinates === 'string' ? params.coordinates : undefined;
  const titleParam = typeof params.title === 'string' ? params.title : undefined;
  const cityParam = typeof params.city === 'string' ? params.city : undefined;

  const selectedRoute = routeIdParam ? getRouteById(routeIdParam) : undefined;
  const fallbackCoordinates = useMemo(() => parseCoordinates(coordinatesParam), [coordinatesParam]);

  const coordinates: NavigationCoordinate[] = useMemo(() => {
    let raw: NavigationCoordinate[] = [];
    if (selectedRoute) {
      raw = selectedRoute.stops.map((stop) => ({
        latitude: stop.coordinate[1],
        longitude: stop.coordinate[0],
      }));
    } else {
      raw = fallbackCoordinates;
    }
    
    // Filter out duplicates or points that are too close (simplistic check)
    return raw.filter((coord, index, self) => 
      index === 0 || 
      Math.abs(coord.latitude - self[index-1].latitude) > 0.00001 || 
      Math.abs(coord.longitude - self[index-1].longitude) > 0.00001
    );
  }, [fallbackCoordinates, selectedRoute]);

  const routeTitle =
    selectedRoute?.title ||
    (titleParam && titleParam.trim().length > 0 ? titleParam : 'Custom route');

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      parent?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  useEffect(() => {
    if (coordinates.length >= 2) return;
    Alert.alert('Route Missing', 'No valid route coordinates found.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [coordinates.length, router]);

  useEffect(() => {
    console.log('Navigating with coordinates:', JSON.stringify(coordinates));
  }, [coordinates]);

  const handleFinalDestinationArrival = useCallback(async () => {
    if (user && !completionRecordedRef.current) {
      completionRecordedRef.current = true;
      try {
        await recordRouteCompletion({
          userId: user.id,
          routeId: routeIdParam,
          routeTitle,
          city: cityParam,
        });
      } catch (error) {
        console.warn('Failed to record route completion', error);
      }
    }

    Alert.alert(
      'Navigation Complete',
      `You have arrived at the final stop for ${routeTitle}.`,
      [{ text: 'OK', onPress: () => router.back() }],
    );
  }, [cityParam, routeIdParam, routeTitle, router, user]);

  if (coordinates.length < 2) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <MapboxNavigationView
        style={styles.navigation}
        coordinates={coordinates}
        waypointIndices={[]}
        routeProfile="walking"
        onCancelNavigation={() => router.back()}
        onWaypointArrival={(e) => { console.log('Waypoint arrived:', e.nativeEvent); }}
        onFinalDestinationArrival={handleFinalDestinationArrival}
        onRouteFailedToLoad={(e) => {
          console.error('Route failed:', e.nativeEvent?.errorMessage);
          Alert.alert('Route Error', e.nativeEvent?.errorMessage || 'Failed to load route');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navigation: { flex: 1 },
});
