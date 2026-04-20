import { Component, signal } from '@angular/core';
import { CompletedOrder, Deliveries } from '../../models/deliveries';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-activedeliveries',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './activedeliveries.html',
  styleUrl: './activedeliveries.css',
})
export class Activedeliveries {

  isOnline = signal(true);

  activeDeliveries = signal<Deliveries[]>([
    {
      id: 'M1243', customerName: 'Nora A.', item: 'Grilled Chicken Meal',
      price: 8, status: 'In Transit', pickupLoc: 'Building A, Main Cafeteria',
      pickupTime: '10:15 AM', deliveryLoc: 'Dorm B, Room 305', distance: '1.1 km', eta: '8 mins'
    },
    {
      id: 'M1244', customerName: 'Youssef M.', item: 'Print 15 Pages + Binding',
      price: 6, status: 'Heading to Pickup', pickupLoc: 'Building B, Print Shop',
      deliveryLoc: 'Library, 3rd Floor', distance: '0.7 km', eta: '5 mins'
    }
  ]);

  completedToday = signal<CompletedOrder[]>([
    { id: 'M1241', customerName: 'Mohammed S.', items: 'Coffee & Pastry', earnings: 5, rating: 5 },
    { id: 'M1240', customerName: 'Aisha K.', items: 'Notebook & Pens', earnings: 6, rating: 5 },
    { id: 'M1239', customerName: 'Tariq H.', items: 'Sandwich & Juice', earnings: 7, rating: 4 }
  ]);

}
