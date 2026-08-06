const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

export const APP_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL,
  riderPortalUrl: import.meta.env.VITE_RIDER_PORTAL_URL,
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
