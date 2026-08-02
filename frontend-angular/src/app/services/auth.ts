import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse, Rider } from '../models/rider';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/'; 

  register(riderData: Partial<Rider>): Observable<AuthResponse> {
    const dataToSend = { ...riderData, role: 'DELIVERY' };
    return this.http.post<AuthResponse>(`${this.baseUrl}user/register`, dataToSend);
  }


uploadImage(file: File): Observable<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append('image', file); 
  return this.http.post<{ imageUrl: string }>(`${this.baseUrl}upload/image`, formData);
}



login(credentials: { phone: string; nationalId: string }): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.baseUrl}user/login`, credentials);
}

  saveToken(token: string): void {
    localStorage.setItem('makook_token', token);
  }
}