import { Component, inject } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard.service';
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

  // ── State Signal References (Delegated to DashboardService) ──
  readonly verificationStatus = this.dashboardService.verificationStatus;
  readonly riderStatus = this.dashboardService.riderStatus;
  readonly earnings = this.dashboardService.earnings;
  readonly completed = this.dashboardService.completed;
  readonly onlineHours = this.dashboardService.onlineHours;
  readonly rating = this.dashboardService.rating;
  readonly activeDelivery = this.dashboardService.activeDelivery;
  readonly nearbyOrders = this.dashboardService.nearbyOrders;

  // ── Action Delegations ──
  toggleStatus(): void {
    this.dashboardService.toggleStatus();
  }

  logout(): void {
    this.dashboardService.logout();
  }

  onAcceptOrder(order: NearbyOrder): void {
    this.dashboardService.acceptOrder(order);
  }

  onDeclineOrder(order: NearbyOrder): void {
    this.dashboardService.declineOrder(order);
  }
}
