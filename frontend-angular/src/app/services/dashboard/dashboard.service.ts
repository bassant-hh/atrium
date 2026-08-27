import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth';
import { RiderTrackingService } from '../rider-tracking.service';
import { RiderDutyStatus, VerificationStatus } from '../../models/dashboard/rider.models';
import {
  AcceptOrderResponse,
  ActiveDelivery,
  DeclineOrderResponse,
  DeliverOrderResponse,
  NearbyOrder,
  PickupOrderResponse,
} from '../../models/dashboard/order.models';
import {
  DashboardStatsResponse,
  RiderStatusResponse,
} from '../../models/dashboard/dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  // ==========================================================================
  // 1. Dependencies
  // ==========================================================================
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly riderTrackingService = inject(RiderTrackingService);
  private readonly router = inject(Router);

  private socket: Socket | null = null;

  // ==========================================================================
  // 2. Configuration & Endpoints
  // ==========================================================================
  private readonly endpoints = {
    userProfile: `${environment.apiUrl}/user/profile`,
    riderStatus: `${environment.apiUrl}/rider/status`,
    nearbyOrders: `${environment.apiUrl}/orders/nearby`,
    acceptOrder: (id: string) => `${environment.apiUrl}/orders/${id}/accept`,
    declineOrder: (id: string) => `${environment.apiUrl}/orders/${id}/decline`,
    pickupOrder: (id: string) => `${environment.apiUrl}/orders/${id}/pickup`,
    deliverOrder: (id: string) => `${environment.apiUrl}/orders/${id}/deliver`,
    dashboardStats: `${environment.apiUrl}/dashboard/stats`,
    activeOrder: `${environment.apiUrl}/orders/active`,
  };

  // ==========================================================================
  // 3. Signals & Application State
  // ==========================================================================
  readonly loading = signal<boolean>(false);
  readonly submittingOrderId = signal<string | null>(null);
  readonly apiError = signal<string | null>(null);

  readonly firstName = signal<string>('');
  readonly lastName = signal<string>('');

  readonly verificationStatus = signal<VerificationStatus>('APPROVED');
  readonly riderStatus = signal<RiderDutyStatus>('OFFLINE');

  readonly earnings = signal<string>('EGP 0');
  readonly completed = signal<number>(0);
  readonly onlineHours = signal<string>('0 hrs');
  readonly rating = signal<string>('0.0★');

  readonly activeDelivery = signal<ActiveDelivery | null>(null);
  readonly nearbyOrders = signal<NearbyOrder[]>([]);

  constructor() {
    this.fetchUserProfile();
    this.fetchRiderStatus();
    this.loadNearbyOrders();
    this.loadDashboardStats();
    this.loadActiveDelivery();
    this.initRealtimeOrderEvents();
  }

  fetchUserProfile(): void {
    this.http.get<{ firstName?: string; lastName?: string }>(this.endpoints.userProfile).subscribe({
      next: (profile) => {
        if (profile) {
          if (profile.firstName) this.firstName.set(profile.firstName);
          if (profile.lastName) this.lastName.set(profile.lastName);
        }
      },
      error: (_err) => {
        // Non-blocking profile load error
      },
    });
  }

  // ==========================================================================
  // 4. Private Helpers & Realtime Listeners
  // ==========================================================================
  private updateStatusSignals(res: RiderStatusResponse): void {
    if (res.verificationStatus) {
      this.verificationStatus.set(res.verificationStatus);
    }
    if (res.riderStatus) {
      this.riderStatus.set(res.riderStatus);
    }
  }

  private initRealtimeOrderEvents(): void {
    const token = this.authService.getToken();
    if (!token) return;

    const socketUrl = `${environment.apiUrl.replace(/\/$/, '')}/realtime`;
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    this.socket.on('connect', () => {
      // Re-synchronize nearby orders from REST on reconnect
      this.loadNearbyOrders();
    });

    this.socket.on('order:available', (newOrder: NearbyOrder) => {
      if (!newOrder || !newOrder.id) return;
      this.nearbyOrders.update((current) => {
        if (current.some((item) => item.id === newOrder.id)) {
          return current; // Prevent duplicates
        }
        return [newOrder, ...current];
      });
    });

    this.socket.on('order:unavailable', (payload: { orderId: string }) => {
      if (!payload?.orderId) return;
      this.nearbyOrders.update((current) => current.filter((item) => item.id !== payload.orderId));
    });
  }

  dismissError(): void {
    this.apiError.set(null);
  }

  // ==========================================================================
  // 5. Public API (REST Operations)
  // ==========================================================================
  fetchRiderStatus(): void {
    this.loading.set(true);
    this.http.get<RiderStatusResponse>(this.endpoints.riderStatus).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.apiError.set(null);
        this.updateStatusSignals(res);
      },
      error: (_err) => {
        this.loading.set(false);
        this.apiError.set('Unable to communicate with server.');
      },
    });
  }

  loadNearbyOrders(): void {
    this.loading.set(true);
    this.http.get<NearbyOrder[]>(this.endpoints.nearbyOrders).subscribe({
      next: (orders) => {
        this.loading.set(false);
        this.apiError.set(null);
        this.nearbyOrders.set(orders);
      },
      error: (_err) => {
        this.loading.set(false);
        this.apiError.set('Unable to communicate with server.');
      },
    });
  }

  loadDashboardStats(): void {
    this.loading.set(true);
    this.http.get<DashboardStatsResponse>(this.endpoints.dashboardStats).subscribe({
      next: (stats) => {
        this.loading.set(false);
        this.apiError.set(null);
        this.earnings.set(`EGP ${stats.earnings}`);
        this.completed.set(stats.completed);
        this.rating.set(`${stats.rating}★`);
        this.onlineHours.set(`${stats.onlineHours} hrs`);
      },
      error: (_err) => {
        this.loading.set(false);
        this.apiError.set('Unable to communicate with server.');
      },
    });
  }

  loadActiveDelivery(): void {
    this.loading.set(true);
    this.http.get<ActiveDelivery | null>(this.endpoints.activeOrder).subscribe({
      next: (active) => {
        this.loading.set(false);
        this.apiError.set(null);
        if (active) {
          this.activeDelivery.set(active);
          this.riderStatus.set('DELIVERING');
          this.riderTrackingService.startTracking(active.orderId);
        } else {
          this.activeDelivery.set(null);
          this.riderTrackingService.stopTracking();
        }
      },
      error: (_err) => {
        this.loading.set(false);
        this.apiError.set('Unable to communicate with server.');
      },
    });
  }

  toggleStatus(): void {
    if (this.riderStatus() === 'DELIVERING') {
      return;
    }

    const nextDutyStatus: RiderDutyStatus = this.riderStatus() === 'OFFLINE' ? 'ONLINE' : 'OFFLINE';

    this.loading.set(true);
    this.http
      .patch<RiderStatusResponse>(this.endpoints.riderStatus, {
        status: nextDutyStatus,
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.apiError.set(null);
          this.updateStatusSignals(res);
        },
        error: (err) => {
          this.loading.set(false);
          const message = err?.error?.message || 'Unable to update rider duty status.';
          this.apiError.set(message);
        },
      });
  }

  acceptOrder(order: NearbyOrder): void {
    if (this.submittingOrderId()) return;

    if (this.riderStatus() === 'OFFLINE') {
      this.apiError.set('Please toggle your status to ONLINE before accepting orders.');
      return;
    }

    this.submittingOrderId.set(order.id);
    this.apiError.set(null);

    this.http.patch<AcceptOrderResponse>(this.endpoints.acceptOrder(order.id), {}).subscribe({
      next: (res) => {
        this.submittingOrderId.set(null);
        this.apiError.set(null);

        // 1. Remove accepted order from nearbyOrders list reactively
        this.nearbyOrders.update((current) => current.filter((item) => item.id !== order.id));

        // 2. Update activeDelivery signal reactively & start live GPS tracking
        if (res.activeDelivery) {
          this.activeDelivery.set({
            orderId: res.activeDelivery.orderId,
            customerName: res.activeDelivery.customerName,
            pickup: res.activeDelivery.pickup,
            dropoff: res.activeDelivery.dropoff,
            estimatedTime: res.activeDelivery.estimatedTime,
            status: res.activeDelivery.status,
            pickupCoordinates: res.activeDelivery.pickupCoordinates,
            destinationCoordinates: res.activeDelivery.destinationCoordinates,
          });
          this.riderStatus.set('DELIVERING');
          this.riderTrackingService.startTracking(res.activeDelivery.orderId);
        }
      },
      error: (err) => {
        this.submittingOrderId.set(null);
        const message = err?.error?.message || 'Unable to accept order. Please try again.';
        this.apiError.set(message);

        if (err?.status === 409 || err?.status === 404) {
          this.nearbyOrders.update((current) => current.filter((item) => item.id !== order.id));
        }
      },
    });
  }

  declineOrder(order: NearbyOrder): void {
    if (this.submittingOrderId()) return;

    this.submittingOrderId.set(order.id);
    this.apiError.set(null);

    this.http.patch<DeclineOrderResponse>(this.endpoints.declineOrder(order.id), {}).subscribe({
      next: (_res) => {
        this.submittingOrderId.set(null);
        this.apiError.set(null);

        // Remove declined order from nearbyOrders signal list
        this.nearbyOrders.update((current) => current.filter((item) => item.id !== order.id));
      },
      error: (err) => {
        this.submittingOrderId.set(null);
        const message = err?.error?.message || 'Unable to decline order. Please try again.';
        this.apiError.set(message);

        if (err?.status === 409 || err?.status === 404) {
          this.nearbyOrders.update((current) => current.filter((item) => item.id !== order.id));
        }
      },
    });
  }

  pickupOrder(orderId: string): void {
    this.loading.set(true);
    this.http.patch<PickupOrderResponse>(this.endpoints.pickupOrder(orderId), {}).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.apiError.set(null);

        if (res.activeDelivery) {
          this.activeDelivery.set({
            orderId: res.activeDelivery.orderId,
            customerName: res.activeDelivery.customerName,
            pickup: res.activeDelivery.pickup,
            dropoff: res.activeDelivery.dropoff,
            estimatedTime: res.activeDelivery.estimatedTime,
            status: res.activeDelivery.status,
            pickupCoordinates: res.activeDelivery.pickupCoordinates,
            destinationCoordinates: res.activeDelivery.destinationCoordinates,
          });
          this.riderTrackingService.startTracking(res.activeDelivery.orderId);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.message || 'Unable to pickup order. Please try again.';
        this.apiError.set(message);
      },
    });
  }

  deliverOrder(orderId: string): void {
    this.loading.set(true);
    this.http.patch<DeliverOrderResponse>(this.endpoints.deliverOrder(orderId), {}).subscribe({
      next: (_res) => {
        this.loading.set(false);
        this.apiError.set(null);

        // 1. Refresh dashboard statistics from real backend API
        this.loadDashboardStats();

        // 2. Set riderStatus signal to ONLINE
        this.riderStatus.set('ONLINE');

        // 3. Stop GPS tracking & clear activeDelivery signal
        this.riderTrackingService.stopTracking();
        this.activeDelivery.set(null);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.message || 'Unable to deliver order. Please try again.';
        this.apiError.set(message);
      },
    });
  }

  logout(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.riderTrackingService.stopTracking();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
