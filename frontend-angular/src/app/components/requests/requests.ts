import { Component, inject } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { NearbyOrdersComponent } from '../dashboard/components/nearby-orders/nearby-orders';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [NearbyOrdersComponent],
  templateUrl: './requests.html',
  styleUrl: './requests.css',
})
export class Requests {
  readonly dashboardService = inject(DashboardService);
}
