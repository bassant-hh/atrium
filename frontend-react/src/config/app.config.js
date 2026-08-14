const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

export const APP_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL,
  riderPortalUrl: import.meta.env.VITE_RIDER_PORTAL_URL,
  osmTileUrl:
    import.meta.env.VITE_OSM_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  osrmBaseUrl: import.meta.env.VITE_OSRM_BASE_URL || 'https://router.project-osrm.org',
};

if (!APP_CONFIG.apiUrl) {
  if (isProduction) {
    throw new Error(
      'CRITICAL CONFIG ERROR: VITE_API_URL environment variable is missing in production.',
    );
  } else {
    console.warn('APP_CONFIG WARNING: VITE_API_URL environment variable is missing.');
  }
}

if (!APP_CONFIG.riderPortalUrl) {
  console.warn('APP_CONFIG WARNING: VITE_RIDER_PORTAL_URL environment variable is missing.');
}
