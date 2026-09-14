import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { RiderTrackingService } from '../../services/rider-tracking.service';
import { ActiveDeliveryCardComponent } from '../dashboard/components/active-delivery-card/active-delivery-card';

@Component({
  selector: 'app-active',
  standalone: true,
  imports: [ActiveDeliveryCardComponent],
  templateUrl: './active.html',
  styleUrl: './active.css',
})
export class Active {
  private dashboardService = inject(DashboardService);
  private riderTrackingService = inject(RiderTrackingService);
  private router = inject(Router);

  readonly activeDelivery = this.dashboardService.activeDelivery;
  readonly pendingConfirmationOrderId = this.dashboardService.pendingConfirmationOrderId;
  readonly riderCoords = this.riderTrackingService.currentCoords;
  readonly loading = this.dashboardService.loading;

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

  onDismissPending(): void {
    this.dashboardService.dismissPendingConfirmation();
    this.router.navigate(['/requests']);
  }
}
