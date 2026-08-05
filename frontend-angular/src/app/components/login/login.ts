import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { LoginRequest } from '../../models/login-request';
import { LoginResponse } from '../../models/login-response';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  errorMessage = signal<string>('');

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload: LoginRequest = {
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!,
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isSubmitted.set(true);
        this.authService.saveToken(res.token);
        this.handleLoginSuccess(res);
      },
      error: (err) => {
        this.isLoading.set(false);

        const status: number = err?.status ?? 0;

        if (status === 401) {
          this.errorMessage.set('Invalid username or password.');
        } else if (status === 403) {
          this.errorMessage.set('Your account is not authorized to log in.');
        } else if (status === 500) {
          this.errorMessage.set('A server error occurred. Please try again later.');
        } else {
          this.errorMessage.set('Login failed. Please check your connection and try again.');
        }
      },
    });
  }

  private handleLoginSuccess(response: LoginResponse): void {
    // TODO: if role === 'ADMIN' → implement admin routing

    if (response.status === 'PENDING') {
      this.router.navigate(['/pending']);
    } else if (response.status === 'APPROVED') {
      this.router.navigate(['/dashboard']);
    } else if (response.status === 'REJECTED') {
      this.router.navigate(['/rejected']);
    }
  }
}
