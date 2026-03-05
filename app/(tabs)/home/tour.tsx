import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { MapboxNavigationView } from '@badatgil/expo-mapbox-navigation';
import { useLayoutEffect } from 'react';

// Cloud Gate (The Bean) → Navy Pier → Willis Tower
const COORDINATES = [
  { latitude: 41.8827, longitude: -87.6233 },  // Cloud Gate, Chicago
  { latitude: 41.8917, longitude: -87.6086 },  // Navy Pier
  { latitude: 41.8789, longitude: -87.6359 },  // Willis Tower
];

export default function ChicagoTourNavigation() {
  const router = useRouter();
  const navigation = useNavigation();

  // Hide the tab bar when this screen is focused
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

  return (
    <View style={styles.container}>
      <MapboxNavigationView
        style={styles.navigation}
        coordinates={COORDINATES}
        waypointIndices={[0, 1, 2]}
        routeProfile="walking"
        onCancelNavigation={() => {
          router.back();
        }}
        onWaypointArrival={(event) => {
          console.log('Arrived at waypoint:', event.nativeEvent);
        }}
        onFinalDestinationArrival={() => {
          Alert.alert(
            'Tour Complete!',
            'You have arrived at Willis Tower — the final stop on your Chicago tour!',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }}
        onRouteProgressChanged={(event) => {
          // You can use this to show distance/time remaining
          // console.log('Progress:', event.nativeEvent);
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

