import { Component, signal } from '@angular/core';
import { Deliveryrequest } from '../../models/deliveryrequest';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-requists',
  imports: [CommonModule, RouterLink,RouterLinkActive],
  templateUrl: './requists.html',
  styleUrl: './requists.css',
})
export class Requists {
    isOnline = signal<boolean>(false);

  requests = signal<Deliveryrequest[]>([
  {
      id: 'M1245', customerName: 'Sarah M.', item: 'Chicken Shawarma & Fries',
      price: 7, pickup: 'Building A, Main Cafeteria', delivery: 'Building C, Room 205',
      distance: '0.8 km', timeAgo: 'Just now', isUrgent: false
    },
    {
      id: 'M1246', customerName: 'Omar K.', item: 'Print 25 Pages (Color)',
      price: 4, pickup: 'Building B, Print Shop', delivery: 'Library, Study Hall 2',
      distance: '0.5 km', timeAgo: '1 min ago', isUrgent: true
    },
    {
      id: 'M1247', customerName: 'Layla H.', item: 'Notebook Set & Highlighters',
      price: 5, pickup: 'Campus Bookstore', delivery: 'Building D, Room 101',
      distance: '1.2 km', timeAgo: '2 mins ago', isUrgent: false
    }
  ]);
  toggleOnline() { this.isOnline.update(v => !v); }
}

