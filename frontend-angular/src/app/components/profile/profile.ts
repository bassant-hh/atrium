import { Component, computed, inject } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly dashboardService = inject(DashboardService);

  readonly firstName = this.dashboardService.firstName;
  readonly lastName = this.dashboardService.lastName;
  readonly email = this.dashboardService.email;
  readonly phone = this.dashboardService.phone;
  readonly university = this.dashboardService.university;
  readonly verificationStatus = this.dashboardService.verificationStatus;
  readonly riderStatus = this.dashboardService.riderStatus;

  readonly fullName = computed(() => {
    const fn = (this.firstName() || '').trim();
    const ln = (this.lastName() || '').trim();
    if (fn && ln) return `${fn} ${ln}`;
    if (fn) return fn;
    if (ln) return ln;
    return '';
  });

  readonly riderInitials = computed(() => {
    const fn = (this.firstName() || '').trim();
    const ln = (this.lastName() || '').trim();
    if (fn && ln) {
      return (fn[0] + ln[0]).toUpperCase();
    }
    if (fn) {
      return fn.slice(0, 2).toUpperCase();
    }
    if (ln) {
      return ln.slice(0, 2).toUpperCase();
    }
    return 'R';
  });

  readonly verificationStatusLabel = computed(() => {
    const status = this.verificationStatus();
    switch (status) {
      case 'APPROVED':
        return 'Approved';
      case 'PENDING':
        return 'Pending';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  });

  readonly riderStatusLabel = computed(() => {
    const status = this.riderStatus();
    switch (status) {
      case 'OFFLINE':
        return 'Offline';
      case 'ONLINE':
        return 'Online';
      case 'DELIVERING':
        return 'Delivering';
      default:
        return status;
    }
  });

  onLogout(): void {
    this.dashboardService.logout();
  }
}
