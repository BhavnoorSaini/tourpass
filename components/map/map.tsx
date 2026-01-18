import Mapbox, { MapView } from '@rnmapbox/maps';

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;
if (!accessToken) {
  throw new Error('Missing Mapbox token.');
}
Mapbox.setAccessToken(accessToken);

export default function Map() {
    return (
        <MapView style={{flex: 1}} styleURL='mapbox://styles/mapbox/outdoors-v12'>

        </MapView>
    );

}