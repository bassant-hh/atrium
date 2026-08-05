import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActiveDelivery } from '../../../../models/dashboard/order.models';

@Component({
  selector: 'app-active-delivery-card',
  standalone: true,
  templateUrl: './active-delivery-card.html',
  styleUrl: './active-delivery-card.css',
})
export class ActiveDeliveryCardComponent {
  @Input() activeDelivery!: ActiveDelivery;
  @Output() pickup = new EventEmitter<void>();
  @Output() deliver = new EventEmitter<void>();

  onAction(): void {
    if (this.activeDelivery?.status === 'PICKED_UP') {
      this.deliver.emit();
    } else {
      this.pickup.emit();
    }
  }
}
