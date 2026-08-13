import { io } from 'socket.io-client';
import { APP_CONFIG } from '../config/app.config';

let socket = null;
let activeOrderId = null;
let locationCallback = null;
let errorCallback = null;

const getCustomerToken = () => {
  return (
    localStorage.getItem('customer_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('makook_token') ||
    ''
  );
};

export const startRealtimeTracking = (orderId, onLocationUpdate, onError) => {
  if (!orderId) return;

  // Stop any previous active subscription cleanly
  stopRealtimeTracking();

  activeOrderId = orderId;
  locationCallback = onLocationUpdate;
  errorCallback = onError;

  const token = getCustomerToken();
  const baseUrl = APP_CONFIG.apiUrl
    ? APP_CONFIG.apiUrl.replace(/\/$/, '')
    : 'http://localhost:3000';
  const socketUrl = `${baseUrl}/realtime`;

  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
  });

  socket.on('connect', () => {
    if (activeOrderId) {
      socket.emit('order:tracking:join', { orderId: activeOrderId });
    }
  });

  socket.on('order:tracking:joined', () => {
    // Room joined successfully
  });

  socket.on('rider:location:updated', (data) => {
    if (data && data.coordinates && locationCallback) {
      locationCallback({
        latitude: Number(data.coordinates.latitude),
        longitude: Number(data.coordinates.longitude),
        timestamp: data.timestamp,
      });
    }
  });

  socket.on('order:tracking:error', (err) => {
    if (errorCallback) {
      errorCallback(err?.message || 'Realtime tracking authorization error.');
    }
  });

  socket.on('disconnect', () => {
    // Socket disconnected cleanly; auto-reconnect handled by socket.io
  });
};

export const stopRealtimeTracking = () => {
  if (socket) {
    if (activeOrderId) {
      socket.emit('order:tracking:leave', { orderId: activeOrderId });
    }
    socket.off();
    socket.disconnect();
    socket = null;
  }
  activeOrderId = null;
  locationCallback = null;
  errorCallback = null;
};
