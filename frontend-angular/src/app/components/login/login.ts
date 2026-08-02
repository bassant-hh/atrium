import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);

  loginForm = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    nationalId: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]]
  });

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      
      const credentials = { 
        phone: this.loginForm.value.phone!,
        nationalId: this.loginForm.value.nationalId!
      };

      this.authService.login(credentials).subscribe({
        next: (res) => {
          this.authService.saveToken(res.token);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Login error', err);
        }
      });
    }
  }
}