import { Component, inject, OnInit, signal } from '@angular/core';
import { ActiveRequest } from '../../models/request';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface UserProfile {
  _id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  university?: string;
  status?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);

  isOnline = signal<boolean>(false);
  userProfile = signal<UserProfile | null>(null);

  stats = signal({
    earnings: '1,250',
    deliveriesToday: 8,
    completed: 156,
    rating: 4.9,
  });

  activeRequests = signal<ActiveRequest[]>([
    {
      id: 'M1240',
      customerName: 'Sarah M.',
      item: 'Chicken Shawarma',
      price: 25,
      pickup: 'Building A, Cafeteria',
      delivery: 'Building C, Room 205',
    },
    {
      id: 'M1241',
      customerName: 'Omar K.',
      item: 'Print Documents',
      price: 10,
      pickup: 'Library Center',
      delivery: 'Building D, Room 101',
    },
  ]);

  ngOnInit(): void {
    this.http.get<UserProfile>('http://localhost:3000/user/profile').subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
      },
      error: (err) => {
        console.error('Failed to load profile', err);
      },
    });
  }

  toggleOnline(): void {
    this.isOnline.update((v) => !v);
  }

  acceptOrder(id: string): void {
    console.log('Accepted order:', id);
    this.activeRequests.update((reqs) => reqs.filter((r) => r.id !== id));
  }

  getUserInitials(): string {
    const p = this.userProfile();
    if (!p) return 'AA';
    const first = p.firstName ? p.firstName.charAt(0).toUpperCase() : '';
    const last = p.lastName ? p.lastName.charAt(0).toUpperCase() : '';
    return first + last || 'AA';
  }

  getUserDisplayName(): string {
    const p = this.userProfile();
    if (!p) return 'Ahmed Ali';
    if (p.firstName && p.lastName) {
      return `${p.firstName} ${p.lastName}`;
    }
    return p.firstName || p.username || 'Ahmed Ali';
  }
}
