import { Component, inject } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private dashboardService = inject(DashboardService);

  logout(): void {
    this.dashboardService.logout();
  }
}
