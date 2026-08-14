import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RiderDutyStatus } from '../../../../models/dashboard/rider.models';

@Component({
  selector: 'app-rider-status-card',
  standalone: true,
  templateUrl: './rider-status-card.html',
  styleUrl: './rider-status-card.css',
})
export class RiderStatusCardComponent {
  @Input() status: RiderDutyStatus = 'OFFLINE';
  @Output() toggleStatus = new EventEmitter<void>();

  onToggle(): void {
    if (this.status === 'DELIVERING') {
      return;
    }
    this.toggleStatus.emit();
  }
}
