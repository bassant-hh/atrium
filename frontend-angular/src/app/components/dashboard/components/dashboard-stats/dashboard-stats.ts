import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  templateUrl: './dashboard-stats.html',
  styleUrl: './dashboard-stats.css',
})
export class DashboardStatsComponent {
  @Input() earnings: string = '';
  @Input() completed: number = 0;
  @Input() onlineHours: string = '';
  @Input() rating: string = '';
}
