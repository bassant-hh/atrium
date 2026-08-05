import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-rider-status-card',
  standalone: true,
  templateUrl: './rider-status-card.html',
  styleUrl: './rider-status-card.css',
})
export class RiderStatusCardComponent {
  @Input() status: 'OFFLINE' | 'ONLINE' = 'OFFLINE';
  @Output() toggleStatus = new EventEmitter<void>();

  onToggle(): void {
    this.toggleStatus.emit();
  }
}
