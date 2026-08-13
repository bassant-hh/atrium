/**
 * Routing Service (Phase 10B)
 * Handles route calculation via Google Maps Routes Library (Route.computeRoutes)
 * and controlled recalculation policy.
 */

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
 * Format duration string from seconds or ISO duration string.
 */
export const formatDurationText = (durationInput) => {
  if (durationInput == null) return null;
  let seconds = 0;

  if (typeof durationInput === 'number') {
    seconds = durationInput;
  } else if (typeof durationInput === 'string') {
    // Check if string ends with 's', e.g. "360s"
    const cleaned = durationInput.replace('s', '').trim();
    seconds = parseInt(cleaned, 10) || 0;
  } else if (typeof durationInput === 'object' && durationInput.seconds) {
    seconds = parseInt(durationInput.seconds, 10) || 0;
  }

  if (seconds <= 0) return null;
  const minutes = Math.ceil(seconds / 60);

  if (minutes <= 1) return '~1 min';
  return `~${minutes} min`;
};

/**
 * Format distance string from meters.
 */
export const formatDistanceText = (metersInput) => {
  if (metersInput == null) return null;
  const meters = Number(metersInput);
  if (isNaN(meters) || meters <= 0) return null;

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
};

/**
 * Decodes an Encoded Polyline algorithm string into array of {lat, lng} objects.
 */
export const decodePolylinePath = (encoded) => {
  if (!encoded || typeof encoded !== 'string') return [];
  const poly = [];
  let index = 0,
    len = encoded.length;
  let lat = 0,
    lng = 0;

  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return poly;
};

/**
 * Fetches route and ETA using Google Maps Routes Library (Route.computeRoutes).
 */
export const fetchRouteAndETA = async ({ origin, destination }) => {
  if (
    !origin ||
    !destination ||
    origin.latitude == null ||
    origin.longitude == null ||
    destination.latitude == null ||
    destination.longitude == null
  ) {
    return { success: false, error: 'Missing coordinates for routing' };
  }

  if (!window.google || !window.google.maps) {
    return { success: false, error: 'Google Maps SDK not loaded' };
  }

  try {
    let RouteClass = window.google.maps.Route;
    if (!RouteClass && window.google.maps.importLibrary) {
      const routesLib = await window.google.maps.importLibrary('routes');
      RouteClass = routesLib?.Route;
    }

    // Prepare origin and destination locations
    const originLocation = {
      location: {
        latLng: {
          lat: Number(origin.latitude),
          lng: Number(origin.longitude),
        },
      },
    };

    const destinationLocation = {
      location: {
        latLng: {
          lat: Number(destination.latitude),
          lng: Number(destination.longitude),
        },
      },
    };

    // Use Route.computeRoutes if available in SDK
    if (RouteClass && typeof RouteClass.computeRoutes === 'function') {
      const request = {
        origin: originLocation,
        destination: destinationLocation,
        travelMode: 'DRIVE',
        fields: ['routes.duration', 'routes.distanceMeters', 'routes.polyline', 'routes.legs'],
      };

      const response = await RouteClass.computeRoutes(request);
      const routes = response?.routes;

      if (routes && routes.length > 0) {
        const primaryRoute = routes[0];
        const rawDuration = primaryRoute.duration || primaryRoute.legs?.[0]?.duration;
        const rawDistance = primaryRoute.distanceMeters || primaryRoute.legs?.[0]?.distanceMeters;

        const durationText = formatDurationText(rawDuration);
        const distanceText = formatDistanceText(rawDistance);

        // Extract polyline path coordinates
        let path = [];
        if (primaryRoute.polyline?.encodedPolyline) {
          path = decodePolylinePath(primaryRoute.polyline.encodedPolyline);
        } else if (primaryRoute.legs?.[0]?.polyline?.encodedPolyline) {
          path = decodePolylinePath(primaryRoute.legs[0].polyline.encodedPolyline);
        }

        return {
          success: true,
          routeObject: primaryRoute, // Isolated provider reference for MapAdapter
          durationText,
          distanceText,
          rawDuration,
          rawDistance,
          path,
        };
      }
    }

    // Fallback: Check if google.maps.routes namespace exists or alternative Route API
    if (window.google.maps.routes && window.google.maps.routes.Route) {
      const RouteNs = window.google.maps.routes.Route;
      if (typeof RouteNs.computeRoutes === 'function') {
        const response = await RouteNs.computeRoutes({
          origin: originLocation,
          destination: destinationLocation,
          travelMode: 'DRIVE',
        });
        if (response?.routes?.[0]) {
          const primaryRoute = response.routes[0];
          const durationText = formatDurationText(primaryRoute.duration);
          const distanceText = formatDistanceText(primaryRoute.distanceMeters);
          let path = [];
          if (primaryRoute.polyline?.encodedPolyline) {
            path = decodePolylinePath(primaryRoute.polyline.encodedPolyline);
          }
          return {
            success: true,
            routeObject: primaryRoute,
            durationText,
            distanceText,
            path,
          };
        }
      }
    }

    return { success: false, error: 'No route found' };
  } catch (err) {
    console.warn('Google Maps Routes API computation error:', err);
    return { success: false, error: 'ETA temporarily unavailable' };
  }
};
