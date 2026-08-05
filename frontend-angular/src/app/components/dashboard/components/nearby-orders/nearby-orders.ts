import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NearbyOrder } from '../../../../models/dashboard/order.models';

@Component({
  selector: 'app-nearby-orders',
  standalone: true,
  templateUrl: './nearby-orders.html',
  styleUrl: './nearby-orders.css',
})
export class NearbyOrdersComponent {
  @Input() orders: NearbyOrder[] = [];
  @Output() accept = new EventEmitter<NearbyOrder>();
  @Output() decline = new EventEmitter<NearbyOrder>();

  onAccept(order: NearbyOrder): void {
    this.accept.emit(order);
  }

  onDecline(order: NearbyOrder): void {
    this.decline.emit(order);
  }
}
