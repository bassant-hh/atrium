import { APP_CONFIG } from '../config/app.config';

export const goToRiderPortal = (path = '/login') => {
  const baseUrl = APP_CONFIG.riderPortalUrl;
  if (!baseUrl) {
    console.error('Cannot redirect to Rider Portal: VITE_RIDER_PORTAL_URL is undefined.');
    return;
  }
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  window.location.href = `${cleanBase}${cleanPath}`;
};
