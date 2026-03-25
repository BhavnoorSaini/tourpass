import type { LngLat, RouteOption } from '@/types/route';

const MAPBOX_SEARCH_API_BASE = 'https://api.mapbox.com/search';
const MAPBOX_DIRECTIONS_API_BASE = 'https://api.mapbox.com/directions/v5/mapbox';

export interface MapboxSuggestion {
  mapboxId: string;
  name: string;
  fullAddress: string;
}

export interface RetrievedMapboxLocation {
  mapboxId: string;
  name: string;
  fullAddress: string;
  coordinate: LngLat;
}

function getMapboxAccessToken() {
  const accessToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN;

  if (!accessToken) {
    throw new Error('Missing Mapbox token.');
  }

  return accessToken;
}

export function createSearchSessionToken() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

export async function searchMapboxSuggestions(query: string, sessionToken: string, proximity?: LngLat) {
  if (!query.trim()) {
    return [] as MapboxSuggestion[];
  }

  const params = new URLSearchParams({
    q: query,
    language: 'en',
    limit: '8',
    session_token: sessionToken,
    access_token: getMapboxAccessToken(),
  });

  if (proximity) {
    params.set('proximity', `${proximity[0]},${proximity[1]}`);
  }

  const response = await fetch(`${MAPBOX_SEARCH_API_BASE}/searchbox/v1/suggest?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Search failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data?.suggestions)) {
    return [] as MapboxSuggestion[];
  }

  return data.suggestions
    .filter((suggestion: any) => typeof suggestion?.mapbox_id === 'string')
    .map((suggestion: any) => ({
      mapboxId: suggestion.mapbox_id,
      name: suggestion.name ?? suggestion.full_address ?? 'Unknown place',
      fullAddress: suggestion.full_address ?? suggestion.place_formatted ?? suggestion.name ?? 'Unknown place',
    }));
}

export async function retrieveMapboxLocation(mapboxId: string, sessionToken: string) {
  const response = await fetch(
    `${MAPBOX_SEARCH_API_BASE}/searchbox/v1/retrieve/${encodeURIComponent(mapboxId)}?session_token=${encodeURIComponent(sessionToken)}&access_token=${encodeURIComponent(getMapboxAccessToken())}`,
  );

  if (!response.ok) {
    throw new Error(`Retrieve failed with status ${response.status}`);
  }

  const data = await response.json();
  const feature = Array.isArray(data?.features) ? data.features[0] : null;
  const coordinates = feature?.geometry?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error('No coordinates found for this place');
  }

  return {
    mapboxId,
    name: feature?.properties?.name ?? feature?.properties?.full_address ?? 'Unknown place',
    fullAddress: feature?.properties?.full_address ?? feature?.properties?.name ?? 'Unknown place',
    coordinate: [coordinates[0], coordinates[1]] as LngLat,
  } as RetrievedMapboxLocation;
}

export async function fetchDirectionsOptions(stops: LngLat[], profile: 'walking' | 'driving' | 'cycling' = 'walking') {
  if (stops.length < 2) {
    return [] as RouteOption[];
  }

  const coordinateString = stops.map(([lng, lat]) => `${lng},${lat}`).join(';');

  const params = new URLSearchParams({
    alternatives: 'true',
    geometries: 'geojson',
    overview: 'full',
    steps: 'false',
    access_token: getMapboxAccessToken(),
  });

  const response = await fetch(
    `${MAPBOX_DIRECTIONS_API_BASE}/${profile}/${coordinateString}?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`Directions failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data?.routes)) {
    return [] as RouteOption[];
  }

  return data.routes
    .filter((route: any) => Array.isArray(route?.geometry?.coordinates))
    .map((route: any, index: number) => ({
      id: `option-${index}`,
      coordinates: route.geometry.coordinates as LngLat[],
      durationSeconds: typeof route.duration === 'number' ? route.duration : 0,
      distanceMeters: typeof route.distance === 'number' ? route.distance : 0,
    }));
}
