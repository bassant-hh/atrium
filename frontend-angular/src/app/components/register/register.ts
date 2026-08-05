import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { RegisterRequest } from '../../models/register-request';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
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
  errorMessage = signal<string>('');

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

  registerForm = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],

      lastName: ['', [Validators.required, Validators.minLength(2)]],

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
    },
    { validators: passwordsMatchValidator },
  );

  nextStep(): void {
    if (!this.canGoNext()) {
      switch (this.currentStep()) {
        case 1:
          ['firstName', 'lastName', 'university', 'phone'].forEach((field) =>
            this.registerForm.get(field)?.markAsTouched(),
          );
          break;
        case 2:
          ['idFront', 'idBack'].forEach((field) => this.registerForm.get(field)?.markAsTouched());
          break;
        case 3:
          ['email', 'username', 'password', 'confirmPassword', 'bikeType'].forEach((field) =>
            this.registerForm.get(field)?.markAsTouched(),
          );
          break;
      }
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
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const frontFile = this.registerForm.value.idFront;
    const backFile = this.registerForm.value.idBack;

    if (!(frontFile instanceof File) || !(backFile instanceof File)) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const val = this.registerForm.value;

    this.authService
      .uploadIds(frontFile, backFile)
      .pipe(
        switchMap((uploadRes) => {
          const payload: RegisterRequest = {
            firstName: val.firstName ?? '',
            lastName: val.lastName ?? '',
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
          const status: number = err?.status ?? 0;

          if (status === 400) {
            this.errorMessage.set('Registration failed.');
          } else if (status === 409) {
            this.errorMessage.set('Username or email already exists.');
          } else if (status === 500) {
            this.errorMessage.set('Server error.');
          } else {
            this.errorMessage.set('Please check your internet connection.');
          }
        },
      });
  }

  onFrontSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const control = this.registerForm.get('idFront');
    control?.patchValue(input.files[0]);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  onBackSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const control = this.registerForm.get('idBack');
    control?.patchValue(input.files[0]);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  canGoNext(): boolean {
    switch (this.currentStep()) {
      case 1:
        return !!(
          this.registerForm.get('firstName')?.valid &&
          this.registerForm.get('lastName')?.valid &&
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
