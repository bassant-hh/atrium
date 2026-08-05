import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth';
import { RiderDutyStatus, VerificationStatus } from '../../models/dashboard/rider.models';
import { ActiveDelivery, NearbyOrder } from '../../models/dashboard/order.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private authService = inject(AuthService);
  private router = inject(Router);

  // ==========================================================================
  // 1. Verification Signals
  // ==========================================================================
  readonly verificationStatus = signal<VerificationStatus>('APPROVED');

  // ==========================================================================
  // 2. Rider Duty Signals
  // ==========================================================================
  readonly riderStatus = signal<RiderDutyStatus>('OFFLINE');

  // ==========================================================================
  // 3. Performance Statistics Signals
  // ==========================================================================
  readonly earnings = signal<string>('EGP 240');
  readonly completed = signal<number>(12);
  readonly onlineHours = signal<string>('5.3 hrs');
  readonly rating = signal<string>('4.9★');

  // ==========================================================================
  // 4. Active Delivery Signals
  // ==========================================================================
  readonly activeDelivery = signal<ActiveDelivery>({
    orderId: '#M1240',
    customerName: 'Sarah M.',
    pickup: 'Central Cafeteria (Building A)',
    dropoff: 'Engineering Hall (Room 205)',
    estimatedTime: '15 mins',
  });

  // ==========================================================================
  // 5. Nearby Orders Queue Signals
  // ==========================================================================
  readonly nearbyOrders = signal<NearbyOrder[]>([
    {
      id: 'M1241',
      customerName: 'Omar K.',
      pickup: 'Library Center',
      destination: 'Faculty of Arts (Room 101)',
      distance: '0.8 km',
      earnings: 'EGP 25',
    },
    {
      id: 'M1242',
      customerName: 'Fatima A.',
      pickup: 'Science Lab B',
      destination: 'Dormitory Block 3',
      distance: '1.2 km',
      earnings: 'EGP 30',
    },
    {
      id: 'M1243',
      customerName: 'Khaled M.',
      pickup: 'Student Hub',
      destination: 'Sports Complex',
      distance: '0.5 km',
      earnings: 'EGP 20',
    },
  ]);

  // ==========================================================================
  // 6. User Actions
  // ==========================================================================
  toggleStatus(): void {
    this.riderStatus.update((current) => (current === 'OFFLINE' ? 'ONLINE' : 'OFFLINE'));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  acceptOrder(_order: NearbyOrder): void {
    // TODO: Implement order acceptance backend API call in Phase 3
  }

  declineOrder(_order: NearbyOrder): void {
    // TODO: Implement order decline backend API call in Phase 3
  }

  // ==========================================================================
  // 7. Future HTTP Region (Phase 3 Integration)
  // ==========================================================================
  // TODO: loadDashboard()
  // TODO: loadMetrics()
  // TODO: loadNearbyOrders()
  // TODO: refreshStatistics()
  // TODO: updateDutyStatus()

  // ==========================================================================
  // 8. Future WebSocket Region (Phase 3 Integration)
  // ==========================================================================
  // TODO: connectSocket()
  // TODO: subscribeToDispatches()
  // TODO: subscribeToOrderUpdates()
}
