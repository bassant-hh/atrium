import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse } from '../models/rider';
import { RegisterRequest } from '../models/register-request';
import { UploadIdResponse } from '../models/upload-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/';

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}user/register`, payload);
  }

  uploadIds(front: File, back: File): Observable<UploadIdResponse> {
    const formData = new FormData();
    formData.append('idFront', front);
    formData.append('idBack', back);
    return this.http.post<UploadIdResponse>(`${this.baseUrl}upload/image`, formData);
  }

  login(credentials: { phone: string; nationalId: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}user/login`, credentials);
  }

  saveToken(token: string): void {
    localStorage.setItem('makook_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('makook_token');
  }

  logout(): void {
    localStorage.removeItem('makook_token');
  }
}
