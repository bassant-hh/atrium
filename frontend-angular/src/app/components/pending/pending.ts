import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending.html',
  styleUrl: './pending.css',
})
export class Pending {
  private dashboardService = inject(DashboardService);

  logout(): void {
    this.dashboardService.logout();
  }
}
