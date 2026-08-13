import { inject, Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class RiderTrackingService {
  private readonly authService = inject(AuthService);
  private socket: Socket | null = null;
  private watchId: number | null = null;
  private activeOrderId: string | null = null;
  private lastEmitTimestamp = 0;
  private readonly MIN_UPDATE_INTERVAL_MS = 3000;

  readonly trackingActive = signal<boolean>(false);
  readonly trackingError = signal<string | null>(null);
  readonly currentCoords = signal<{ latitude: number; longitude: number } | null>(null);

  startTracking(orderId: string): void {
    if (!orderId) return;
    if (this.activeOrderId === orderId && this.trackingActive()) return;

    this.stopTracking();
    this.activeOrderId = orderId;
    this.trackingError.set(null);

    const token = this.authService.getToken();
    if (!token) {
      this.trackingError.set('Rider token missing.');
      return;
    }

    const socketUrl = `${environment.apiUrl.replace(/\/$/, '')}/realtime`;
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    this.socket.on('connect', () => {
      if (this.activeOrderId) {
        this.socket?.emit('order:tracking:join', { orderId: this.activeOrderId });
      }
    });

    this.socket.on('order:tracking:joined', () => {
      this.trackingActive.set(true);
      this.startGpsWatch();
    });

    this.socket.on('order:tracking:error', (err: { message: string }) => {
      this.trackingError.set(err.message || 'Tracking error.');
    });
  }

  private startGpsWatch(): void {
    if (!navigator.geolocation) {
      this.trackingError.set('Geolocation is not supported by browser.');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - this.lastEmitTimestamp < this.MIN_UPDATE_INTERVAL_MS) {
          return; // Throttle location updates
        }
        this.lastEmitTimestamp = now;

        const coords = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        };

        this.currentCoords.set(coords);

        if (this.socket && this.socket.connected && this.activeOrderId) {
          this.socket.emit('rider:location:update', {
            orderId: this.activeOrderId,
            coordinates: coords,
            timestamp: now,
          });
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          this.trackingError.set('GPS permission denied.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          this.trackingError.set('GPS position unavailable.');
        } else {
          this.trackingError.set('GPS request timed out.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
      },
    );
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.socket) {
      if (this.activeOrderId) {
        this.socket.emit('order:tracking:leave', { orderId: this.activeOrderId });
      }
      this.socket.disconnect();
      this.socket = null;
    }

    this.activeOrderId = null;
    this.trackingActive.set(false);
    this.currentCoords.set(null);
  }
}
