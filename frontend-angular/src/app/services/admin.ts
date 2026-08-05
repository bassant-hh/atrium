import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminRider } from '../models/admin-rider';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/';

  getRiders(): Observable<AdminRider[]> {
    return this.http.get<AdminRider[]>(`${this.baseUrl}admin/riders`);
  }

  getPendingRiders(): Observable<AdminRider[]> {
    return this.http.get<AdminRider[]>(`${this.baseUrl}admin/riders/pending`);
  }

  approveRider(id: string): Observable<AdminRider> {
    return this.http.patch<AdminRider>(`${this.baseUrl}admin/riders/${id}/approve`, {});
  }

  rejectRider(id: string): Observable<AdminRider> {
    return this.http.patch<AdminRider>(`${this.baseUrl}admin/riders/${id}/reject`, {});
  }
}
