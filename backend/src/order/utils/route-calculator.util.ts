export interface CoordinatePair {
  latitude: number;
  longitude: number;
}

export interface OsrmRoute {
  distance: number;
  duration: number;
}

export interface OsrmResponse {
  code: string;
  routes: OsrmRoute[];
}

export interface RouteCalculationResult {
  distance?: string;
  estimatedTime?: string;
}

export function formatDistance(meters: number): string | undefined {
  if (meters == null || !Number.isFinite(meters) || meters <= 0) {
    return undefined;
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string | undefined {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) {
    return undefined;
  }
  const totalMinutes = Math.ceil(seconds / 60);

  if (totalMinutes < 60) {
    return totalMinutes <= 1 ? '~1 min' : `~${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  if (remainingMins === 0) {
    return `~${hours} hr`;
  }
  return `~${hours} hr ${remainingMins} min`;
}

export function isOsrmResponse(data: unknown): data is OsrmResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  if (typeof obj['code'] !== 'string' || obj['code'] !== 'Ok') {
    return false;
  }

  if (!Array.isArray(obj['routes']) || obj['routes'].length === 0) {
    return false;
  }

  const firstRoute = obj['routes'][0];
  if (typeof firstRoute !== 'object' || firstRoute === null) {
    return false;
  }

  const routeObj = firstRoute as Record<string, unknown>;
  return (
    typeof routeObj['distance'] === 'number' &&
    Number.isFinite(routeObj['distance']) &&
    typeof routeObj['duration'] === 'number' &&
    Number.isFinite(routeObj['duration'])
  );
}

export async function calculateDistanceAndDuration(
  pickupCoords?: CoordinatePair | null,
  destCoords?: CoordinatePair | null,
  osrmBaseUrl: string = process.env.OSRM_BASE_URL ||
    'https://router.project-osrm.org',
): Promise<RouteCalculationResult> {
  if (
    !pickupCoords ||
    !destCoords ||
    typeof pickupCoords.latitude !== 'number' ||
    typeof pickupCoords.longitude !== 'number' ||
    typeof destCoords.latitude !== 'number' ||
    typeof destCoords.longitude !== 'number' ||
    !Number.isFinite(pickupCoords.latitude) ||
    !Number.isFinite(pickupCoords.longitude) ||
    !Number.isFinite(destCoords.latitude) ||
    !Number.isFinite(destCoords.longitude)
  ) {
    return {};
  }

  const baseUrl = osrmBaseUrl.replace(/\/$/, '');
  const url = `${baseUrl}/route/v1/driving/${pickupCoords.longitude},${pickupCoords.latitude};${destCoords.longitude},${destCoords.latitude}?overview=false&steps=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        `[OSRM Backend] HTTP Error ${response.status} for URL: ${url}`,
      );
      return {};
    }

    const rawData: unknown = await response.json();

    if (isOsrmResponse(rawData)) {
      const primaryRoute = rawData.routes[0];
      const distanceStr = formatDistance(primaryRoute.distance);
      const timeStr = formatDuration(primaryRoute.duration);

      return {
        distance: distanceStr,
        estimatedTime: timeStr,
      };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn('[OSRM Backend] Route calculation failed:', errorMessage);
  }

  return {};
}
