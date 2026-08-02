import { Component, signal } from '@angular/core';
import { ActiveRequest } from '../../models/request';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule ,RouterLink,RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  isOnline = signal<boolean>(false);
  
  stats = signal({
    earnings: '1,250',
    deliveriesToday: 8,
    completed: 156,
    rating: 4.9
  });

  activeRequests = signal<ActiveRequest[]>([
    {
      id: 'M1240',
      customerName: 'Sarah M.',
      item: 'Chicken Shawarma',
      price: 25,
      pickup: 'Building A, Cafeteria',
      delivery: 'Building C, Room 205'
    },
    {
      id: 'M1241',
      customerName: 'Omar K.',
      item: 'Print Documents',
      price: 10,
      pickup: 'Library Center',
      delivery: 'Building D, Room 101'
    }
  ]);

  toggleOnline(): void {
    this.isOnline.update(v => !v);
  }

  acceptOrder(id: string): void {
    console.log('Accepted order:', id);
    this.activeRequests.update(reqs => reqs.filter(r => r.id !== id));
  }
}