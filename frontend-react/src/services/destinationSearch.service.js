import { apiGet } from './api';

/**
 * Real Geographic Destination Search Service (Frontend Abstraction)
 * Communicates ONLY with the Makook Backend API (/customer/destinations/search).
 * React has ZERO direct knowledge of external geographic providers or Nominatim URLs.
 */

export const searchGeographicDestinations = async (query, coords = null, signal = null) => {
  const trimmed = query ? query.trim() : '';
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    q: trimmed,
  });

  if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
    params.append('latitude', coords.latitude.toString());
    params.append('longitude', coords.longitude.toString());
  }

  try {
    const results = await apiGet(`customer/destinations/search?${params.toString()}`, {
      signal,
    });
    return Array.isArray(results) ? results : [];
  } catch (error) {
    if (error.name === 'AbortError' || error.message?.includes('timed out')) {
      throw error;
    }
    console.warn('Backend geographic destination search notice:', error.message);
    return [];
  }
};
