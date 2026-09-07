import { Component, inject } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { RiderTrackingService } from '../../services/rider-tracking.service';
import { VerificationOverlayComponent } from './components/verification-overlay/verification-overlay';
import { RiderStatusCardComponent } from './components/rider-status-card/rider-status-card';
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats';
import { ActiveDeliveryCardComponent } from './components/active-delivery-card/active-delivery-card';
import { NearbyOrdersComponent } from './components/nearby-orders/nearby-orders';
import { HeatmapPlaceholderComponent } from './components/heatmap-placeholder/heatmap-placeholder';
import { NearbyOrder } from '../../models/dashboard/order.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    VerificationOverlayComponent,
    RiderStatusCardComponent,
    DashboardStatsComponent,
    ActiveDeliveryCardComponent,
    NearbyOrdersComponent,
    HeatmapPlaceholderComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private dashboardService = inject(DashboardService);
  private riderTrackingService = inject(RiderTrackingService);

  // ── State Signal References (Delegated to DashboardService & RiderTrackingService) ──
  readonly firstName = this.dashboardService.firstName;
  readonly lastName = this.dashboardService.lastName;
  readonly verificationStatus = this.dashboardService.verificationStatus;
  readonly riderStatus = this.dashboardService.riderStatus;
  readonly earnings = this.dashboardService.earnings;
  readonly completed = this.dashboardService.completed;
  readonly onlineHours = this.dashboardService.onlineHours;
  readonly statsLoading = this.dashboardService.statsLoading;
  readonly activeDelivery = this.dashboardService.activeDelivery;
  readonly nearbyOrders = this.dashboardService.nearbyOrders;
  readonly submittingOrderId = this.dashboardService.submittingOrderId;
  readonly apiError = this.dashboardService.apiError;
  readonly loading = this.dashboardService.loading;
  readonly riderCoords = this.riderTrackingService.currentCoords;

  get riderInitials(): string {
    const f = this.firstName();
    const l = this.lastName();
    if (!f && !l) return 'MR';
    const firstInitial = f ? f.charAt(0).toUpperCase() : '';
    const lastInitial = l ? l.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}` || 'MR';
  }

  get currentDateFormatted(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }

  // ── Action Delegations ──
  toggleStatus(): void {
    this.dashboardService.toggleStatus();
  }

  logout(): void {
    this.dashboardService.logout();
  }

  dismissError(): void {
    this.dashboardService.dismissError();
  }

  onAcceptOrder(order: NearbyOrder): void {
    this.dashboardService.acceptOrder(order);
  }

  onDeclineOrder(order: NearbyOrder): void {
    this.dashboardService.declineOrder(order);
  }

  onPickupOrder(): void {
    const active = this.activeDelivery();
    if (active && active.orderId) {
      this.dashboardService.pickupOrder(active.orderId);
    }
  }

  onDeliverOrder(): void {
    const active = this.activeDelivery();
    if (active && active.orderId) {
      this.dashboardService.deliverOrder(active.orderId);
    }
  }
}
