import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ActiveDelivery } from '../../../../models/dashboard/order.models';
import { RiderMapComponent } from '../../../map/rider-map';

@Component({
  selector: 'app-active-delivery-card',
  standalone: true,
  imports: [RiderMapComponent],
  templateUrl: './active-delivery-card.html',
  styleUrl: './active-delivery-card.css',
})
export class ActiveDeliveryCardComponent {
  @Input() activeDelivery!: ActiveDelivery;
  @Input() riderCoords: { latitude: number; longitude: number } | null = null;
  @Input() submitting: boolean = false;

  @Output() pickup = new EventEmitter<void>();
  @Output() deliver = new EventEmitter<void>();

  readonly durationText = signal<string | null>(null);
  readonly distanceText = signal<string | null>(null);
  readonly routeError = signal<string | null>(null);

  onRouteCalculated(event: {
    durationText: string | null;
    distanceText: string | null;
    error: string | null;
  }): void {
    this.durationText.set(event.durationText);
    this.distanceText.set(event.distanceText);
    this.routeError.set(event.error);
  }

  onAction(): void {
    if (this.submitting) return;
    if (this.activeDelivery?.status === 'PICKED_UP') {
      this.deliver.emit();
    } else {
      this.pickup.emit();
    }
  }
}
