import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse } from '../models/rider';
import { RegisterRequest } from '../models/register-request';
import { UploadIdResponse } from '../models/upload-response';
import { LoginRequest } from '../models/login-request';
import { LoginResponse } from '../models/login-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/';
  private readonly TOKEN_KEY = 'makook_token';

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}user/register`, payload);
  }

  uploadIds(front: File, back: File): Observable<UploadIdResponse> {
    const formData = new FormData();
    formData.append('idFront', front);
    formData.append('idBack', back);
    return this.http.post<UploadIdResponse>(`${this.baseUrl}upload/image`, formData);
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}user/login`, payload);
  }

  saveToken(token: string): void {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
