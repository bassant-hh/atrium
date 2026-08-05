import { Component, Input } from '@angular/core';
import { ActiveDelivery } from '../../../../models/dashboard/order.models';

@Component({
  selector: 'app-active-delivery-card',
  standalone: true,
  templateUrl: './active-delivery-card.html',
  styleUrl: './active-delivery-card.css',
})
export class ActiveDeliveryCardComponent {
  @Input() activeDelivery!: ActiveDelivery;
}
