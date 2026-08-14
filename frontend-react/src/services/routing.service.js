/**
 * Routing Service (Phase 10B / Phase 12 OSM Migration)
 * Handles route calculation via OSRM (router.project-osrm.org)
 * and controlled recalculation policy.
 */

import { APP_CONFIG } from '../config/app.config';

/**
 * Calculates distance in meters between two lat/lng coordinates using Haversine formula.
 */
export const calculateHaversineDistance = (coords1, coords2) => {
  if (!coords1 || !coords2) return 0;
  const lat1 = Number(coords1.latitude ?? coords1.lat);
  const lon1 = Number(coords1.longitude ?? coords1.lng);
  const lat2 = Number(coords2.latitude ?? coords2.lat);
  const lon2 = Number(coords2.longitude ?? coords2.lng);

  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;

  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Controlled route recalculation policy helper.
 * Enforces:
 * - Minimum refresh interval (20 seconds)
 * - Meaningful movement threshold (150 meters)
 * - Immediate refresh on lifecycle target change
 * - Refresh on stale route (60 seconds)
 */
export const shouldRecalculateRoute = ({
  lastRoutedOrigin,
  currentOrigin,
  lastRequestTime,
  targetChanged = false,
  status,
}) => {
  if (status !== 'ACCEPTED' && status !== 'PICKED_UP') {
    return false;
  }

  if (!currentOrigin || currentOrigin.latitude == null || currentOrigin.longitude == null) {
    return false;
  }

  // Initial calculation or lifecycle target changed
  if (!lastRoutedOrigin || !lastRequestTime || targetChanged) {
    return true;
  }

  const timeElapsed = Date.now() - lastRequestTime;
  const distanceMoved = calculateHaversineDistance(lastRoutedOrigin, currentOrigin);

  // Minimum refresh interval: 20 seconds
  const MIN_INTERVAL_MS = 20000;
  // Meaningful movement threshold: 150 meters
  const MOVEMENT_THRESHOLD_METERS = 150;
  // Stale route threshold: 60 seconds
  const STALE_THRESHOLD_MS = 60000;

  if (timeElapsed >= STALE_THRESHOLD_MS) {
    return true;
  }

  if (timeElapsed >= MIN_INTERVAL_MS && distanceMoved >= MOVEMENT_THRESHOLD_METERS) {
    return true;
  }

  return false;
};

/**
 * Format duration string from seconds.
 */
export const formatDurationText = (seconds) => {
  if (seconds == null || typeof seconds !== 'number' || seconds <= 0) return null;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 2) return '~1 min';
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

/**
 * Format distance string from meters.
 */
export const formatDistanceText = (meters) => {
  if (meters == null) return null;
  const m = Number(meters);
  if (isNaN(m) || m <= 0) return null;
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
};

/**
 * Validates a coordinate object has finite numeric lat/lng in valid ranges.
 */
const isValidCoord = (c) => {
  if (!c) return false;
  const lat = Number(c.latitude);
  const lon = Number(c.longitude);
  return isFinite(lat) && isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

/**
 * Fetches route and ETA using OSRM HTTP API.
 * OSRM endpoint format: /route/v1/driving/{lon1},{lat1};{lon2},{lat2}
 *
 * Returns:
 * {
 *   success: boolean,
 *   distanceMeters: number,
 *   durationSeconds: number,
 *   durationText: string,
 *   distanceText: string,
 *   geometry: { type: 'LineString', coordinates: [[lon, lat], ...] }  // raw OSRM
 *   path: [[lat, lon], ...]  // Leaflet-ready (swapped)
 * }
 */
export const fetchRouteAndETA = async ({ origin, destination }) => {
  if (!isValidCoord(origin) || !isValidCoord(destination)) {
    return { success: false, error: 'Missing or invalid coordinates for routing' };
  }

  const baseUrl = APP_CONFIG.osrmBaseUrl || 'https://router.project-osrm.org';

  // OSRM expects longitude,latitude ordering
  const url = `${baseUrl}/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson&steps=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `OSRM request failed (HTTP ${response.status})` };
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return { success: false, error: 'No OSRM route found' };
    }

    const primaryRoute = data.routes[0];
    const distanceMeters = primaryRoute.distance;
    const durationSeconds = primaryRoute.duration;

    const durationText = formatDurationText(durationSeconds);
    const distanceText = formatDistanceText(distanceMeters);

    // OSRM GeoJSON coords: [longitude, latitude] → Leaflet polyline: [latitude, longitude]
    const rawCoords = primaryRoute.geometry?.coordinates ?? [];
    const path = rawCoords.map(([lon, lat]) => [lat, lon]);

    return {
      success: true,
      distanceMeters,
      durationSeconds,
      durationText,
      distanceText,
      geometry: primaryRoute.geometry,
      path,
    };
  } catch (err) {
    console.warn('[routing.service] OSRM request error:', err);
    return { success: false, error: 'ETA temporarily unavailable' };
  }
};
