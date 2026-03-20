import { useEffect, useLayoutEffect, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { MapboxNavigationView } from '@badatgil/expo-mapbox-navigation';
import { useRoutes } from '@/contexts/RoutesContext';

interface NavigationCoordinate {
  latitude: number;
  longitude: number;
}

function parseCoordinates(serializedCoordinates?: string) {
  if (!serializedCoordinates) {
    return [] as NavigationCoordinate[];
  }

  try {
    const parsed = JSON.parse(serializedCoordinates);
    if (!Array.isArray(parsed)) {
      return [] as NavigationCoordinate[];
    }

    return parsed.filter(
      (item) =>
        typeof item?.latitude === 'number' &&
        typeof item?.longitude === 'number',
    ) as NavigationCoordinate[];
  } catch {
    return [] as NavigationCoordinate[];
  }
}

export default function TourNavigation() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { getRouteById } = useRoutes();

  const routeIdParam = typeof params.routeId === 'string' ? params.routeId : undefined;
  const coordinatesParam =
    typeof params.coordinates === 'string' ? params.coordinates : undefined;
  const titleParam = typeof params.title === 'string' ? params.title : undefined;

  const selectedRoute = routeIdParam ? getRouteById(routeIdParam) : undefined;

  const fallbackCoordinates = useMemo(
    () => parseCoordinates(coordinatesParam),
    [coordinatesParam],
  );

  const coordinates: NavigationCoordinate[] = useMemo(() => {
    if (selectedRoute) {
      return selectedRoute.stops.map((stop) => ({
        latitude: stop.coordinate[1],
        longitude: stop.coordinate[0],
      }));
    }

    return fallbackCoordinates;
  }, [fallbackCoordinates, selectedRoute]);

  const routeTitle =
    selectedRoute?.title ||
    (titleParam && titleParam.trim().length > 0
      ? titleParam
      : 'Custom route');

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      parent?.setOptions({
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          elevation: 0,
          marginHorizontal: 10,
          height: 58,
          backgroundColor: '#320e4f',
          borderRadius: 16,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOpacity: 0.3,
        },
      });
    };
  }, [navigation]);

  useEffect(() => {
    if (coordinates.length >= 2) {
      return;
    }

    Alert.alert(
      'Route Missing',
      'No valid route coordinates were found for navigation.',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  }, [coordinates.length, router]);

  if (coordinates.length < 2) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <MapboxNavigationView
        style={styles.navigation}
        coordinates={coordinates}
        waypointIndices={coordinates.map((_, index) => index)}
        routeProfile="walking"
        onCancelNavigation={() => {
          router.back();
        }}
        onWaypointArrival={(event) => {
          console.log('Arrived at waypoint:', event.nativeEvent);
        }}
        onFinalDestinationArrival={() => {
          Alert.alert(
            'Navigation Complete',
            `You have arrived at the final stop for ${routeTitle}.`,
            [{ text: 'OK', onPress: () => router.back() }],
          );
        }}
        onRouteFailedToLoad={(event) => {
          console.error('Route failed to load:', event.nativeEvent?.errorMessage);
          Alert.alert('Route Error', event.nativeEvent?.errorMessage || 'Failed to load route');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigation: {
    flex: 1,
  },
});
