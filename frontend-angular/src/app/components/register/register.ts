import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RegisterRequest } from '../../models/register-request';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  public router = inject(Router);

  currentStep = signal<number>(1);
  isLoading = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);

  readonly universities = [
    { id: 'SVU', name: 'South Valley University' },
    { id: 'ASSIUT', name: 'Assiut University' },
    { id: 'SOHAG', name: 'Sohag University' },
    { id: 'MINIA', name: 'Minia University' },
    { id: 'BENI_SUEF', name: 'Beni Suef University' },
    { id: 'LUXOR', name: 'Luxor University' },
    { id: 'ASWAN', name: 'Aswan University' },
    { id: 'NEW_VALLEY', name: 'New Valley University' },
  ];

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],

    university: ['', Validators.required],

    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],

    idFront: [null as File | null, Validators.required],

    idBack: [null as File | null, Validators.required],

    email: ['', [Validators.required, Validators.email]],

    username: [
      '',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z][A-Za-z0-9._]*$/),
      ],
    ],

    password: ['', [Validators.required, Validators.minLength(8)]],

    confirmPassword: ['', Validators.required],

    bikeType: ['', Validators.required],
  });

  nextStep(): void {
    if (!this.canGoNext()) {
      return;
    }

    if (this.currentStep() < 3) {
      this.currentStep.update((step) => step + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);

      const val = this.registerForm.value;
      const frontFile = val.idFront as unknown as File;
      const backFile = val.idBack as unknown as File;

      this.authService
        .uploadIds(frontFile, backFile)
        .pipe(
          switchMap((uploadRes) => {
            const nameParts = (val.fullName ?? '').trim().split(' ');
            const firstName = nameParts[0] || 'Rider';
            const lastName = nameParts.slice(1).join(' ') || 'User';

            const payload: RegisterRequest = {
              firstName,
              lastName,
              email: val.email ?? '',
              username: val.username ?? '',
              password: val.password ?? '',
              role: 'DELIVERY',
              phone: val.phone ?? '',
              university: val.university ?? '',
              idFront: uploadRes.frontUrl,
              idBack: uploadRes.backUrl,
              status: 'PENDING',
            };

            return this.authService.register(payload);
          }),
        )
        .subscribe({
          next: (res) => {
            this.isSubmitted.set(true);
            this.isLoading.set(false);
            this.authService.saveToken(res.token);
            this.router.navigate(['/pending']);
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error('Registration Error', err);
          },
        });
    }
  }

  onFrontSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.registerForm.patchValue({ idFront: input.files[0] });
  }

  onBackSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.registerForm.patchValue({ idBack: input.files[0] });
  }

  canGoNext(): boolean {
    switch (this.currentStep()) {
      case 1:
        return !!(
          this.registerForm.get('fullName')?.valid &&
          this.registerForm.get('university')?.valid &&
          this.registerForm.get('phone')?.valid
        );

      case 2:
        return !!(
          this.registerForm.get('idFront')?.value && this.registerForm.get('idBack')?.value
        );

      case 3:
        return this.registerForm.valid;

      default:
        return false;
    }
  }
}
