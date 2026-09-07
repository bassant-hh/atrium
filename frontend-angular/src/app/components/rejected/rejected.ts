import { Component, inject } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rejected',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rejected.html',
  styleUrl: './rejected.css',
})
export class Rejected {
  private dashboardService = inject(DashboardService);

  logout(): void {
    this.dashboardService.logout();
  }
}
