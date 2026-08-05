import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth';
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
  private readonly router = inject(Router);

  // ==========================================================================
  // 2. Configuration & Endpoints
  // ==========================================================================
  private readonly endpoints = {
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
  readonly apiError = signal<string | null>(null);

  readonly verificationStatus = signal<VerificationStatus>('APPROVED');
  readonly riderStatus = signal<RiderDutyStatus>('OFFLINE');

  readonly earnings = signal<string>('EGP 0');
  readonly completed = signal<number>(0);
  readonly onlineHours = signal<string>('0 hrs');
  readonly rating = signal<string>('0.0★');

  readonly activeDelivery = signal<ActiveDelivery | null>(null);
  readonly nearbyOrders = signal<NearbyOrder[]>([]);

  constructor() {
    this.fetchRiderStatus();
    this.loadNearbyOrders();
    this.loadDashboardStats();
    this.loadActiveDelivery();
  }

  // ==========================================================================
  // 4. Private Helpers
  // ==========================================================================
  private updateStatusSignals(res: RiderStatusResponse): void {
    if (res.verificationStatus) {
      this.verificationStatus.set(res.verificationStatus);
    }
    if (res.riderStatus) {
      this.riderStatus.set(res.riderStatus);
    }
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
        } else {
          this.activeDelivery.set(null);
        }
      },
      error: (_err) => {
        this.loading.set(false);
        this.apiError.set('Unable to communicate with server.');
      },
    });
  }

  toggleStatus(): void {
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
        error: (_err) => {
          this.loading.set(false);
          this.apiError.set('Unable to communicate with server.');
        },
      });
  }

  acceptOrder(order: NearbyOrder): void {
    this.loading.set(true);
    this.http.patch<AcceptOrderResponse>(this.endpoints.acceptOrder(order.id), {}).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.apiError.set(null);

        // 1. Remove accepted order from nearbyOrders list reactively
        this.nearbyOrders.update((current) => current.filter((item) => item.id !== order.id));

        // 2. Update activeDelivery signal reactively
        if (res.activeDelivery) {
          this.activeDelivery.set({
            orderId: res.activeDelivery.orderId,
            customerName: res.activeDelivery.customerName,
            pickup: res.activeDelivery.pickup,
            dropoff: res.activeDelivery.dropoff,
            estimatedTime: res.activeDelivery.estimatedTime,
            status: res.activeDelivery.status,
          });
          this.riderStatus.set('DELIVERING');
        }
      },
      error: (err) => {
        this.loading.set(false);
        const message =
          err?.error?.message ||
          'Unable to accept order. Please verify your duty status and try again.';
        this.apiError.set(message);
      },
    });
  }

  declineOrder(order: NearbyOrder): void {
    this.loading.set(true);
    this.http.patch<DeclineOrderResponse>(this.endpoints.declineOrder(order.id), {}).subscribe({
      next: (_res) => {
        this.loading.set(false);
        this.apiError.set(null);

        // Remove declined order from nearbyOrders signal list
        this.nearbyOrders.update((current) => current.filter((item) => item.id !== order.id));
      },
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.message || 'Unable to decline order. Please try again.';
        this.apiError.set(message);
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
          });
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

        // 3. Clear activeDelivery signal
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
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ==========================================================================
  // 6. Future Extension Points (Phase 5+ Blueprints)
  // ==========================================================================
  // TODO Phase 5: Compute rating from customer reviews.
  // TODO Phase 5: Compute online hours from rider activity logs.
  // TODO: connectSocket()
}
