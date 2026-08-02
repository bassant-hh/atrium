import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { Rider } from '../../models/rider';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
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


  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    university: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],

    idFile: [null as File | null, Validators.required],
    password: ['', [ Validators.minLength(8)]],
    username: ['', [ Validators.minLength(3)]],
    bikeType: ['', Validators.required],
    hasBicycle: [false],
    email: ['', [ Validators.email]],
  });

  nextStep(): void {
    if (this.currentStep() < 3) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  onFileChange(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.registerForm.patchValue({ idFile: fileList[0] });
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      
    const val = this.registerForm.value;
    const file = val.idFile as unknown as File; 
    this.authService.uploadImage(file).pipe(
      switchMap((uploadRes) => {
        
        const nameParts = (val.fullName ?? '').trim().split(' ');
        const firstName = nameParts[0] || 'Rider';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        const riderData: any = { 
          firstName: firstName,
          lastName: lastName,
          email: val.email ?? undefined,
          username: val.username ?? undefined,
          password: val.password ?? undefined,
          role: "DELIVERY", 
          phone: val.phone ?? undefined,
          university: val.university ?? undefined,
          idFile: uploadRes.imageUrl,
          hasBicycle: true,
          status: 'pending'
        };

        return this.authService.register(riderData);
      })
    ).subscribe({
      next: (res) => {
        console.log(res)  
        this.isSubmitted.set(true);
        this.isLoading.set(false);
        this.authService.saveToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Registration Error', err);
      }
    });
  }
}





  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.registerForm.patchValue({ idFile: file });
      console.log('Selected file:', file.name);
    }
  }

  canGoNext(): boolean {
    if (this.currentStep() === 1) {
      return !!(this.registerForm.get('fullName')?.valid &&
        this.registerForm.get('university')?.valid &&
        this.registerForm.get('phone')?.valid);
    }
    if (this.currentStep() === 2) {
      return !!this.registerForm.get('idFile')?.value;
    }
    return true;
  }

}
