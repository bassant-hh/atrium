import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Topbar } from '../../components/topbar/topbar';
import { DashboardService } from '../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Sidebar, Topbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  private readonly dashboardService = inject(DashboardService);

  readonly notification = this.dashboardService.customerConfirmedNotification;

  onDismissNotification(): void {
    this.dashboardService.dismissCustomerConfirmedNotification();
  }
}
