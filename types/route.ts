export type LngLat = [number, number];

export interface RouteStop {
  id: string;
  name: string;
  fullAddress: string;
  mapboxId: string;
  coordinate: LngLat;
}

export interface RouteOption {
  id: string;
  coordinates: LngLat[];
  durationSeconds: number;
  distanceMeters: number;
}

export interface StoredRoute {
  id: string;
  title: string;
  stops: RouteStop[];
  createdAt: string;
}

export interface RoutePreview {
  routeId: string;
  coordinates: LngLat[];
}

export interface RoutePin {
  routeId: string;
  title: string;
  coordinate: LngLat;
}
