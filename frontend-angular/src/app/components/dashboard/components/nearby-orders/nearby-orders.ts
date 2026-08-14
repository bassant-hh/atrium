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
  @Input() submittingId: string | null = null;

  @Output() accept = new EventEmitter<NearbyOrder>();
  @Output() decline = new EventEmitter<NearbyOrder>();

  onAccept(order: NearbyOrder): void {
    if (this.submittingId === order.id) return;
    this.accept.emit(order);
  }

  onDecline(order: NearbyOrder): void {
    if (this.submittingId === order.id) return;
    this.decline.emit(order);
  }
}
