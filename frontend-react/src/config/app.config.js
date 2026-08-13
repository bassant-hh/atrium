const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

export const APP_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL,
  riderPortalUrl: import.meta.env.VITE_RIDER_PORTAL_URL,
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
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

if (!APP_CONFIG.googleMapsApiKey) {
  console.info(
    'APP_CONFIG INFO: VITE_GOOGLE_MAPS_API_KEY is not set. MapAdapter will run with interactive fallback map engine.',
  );
}
