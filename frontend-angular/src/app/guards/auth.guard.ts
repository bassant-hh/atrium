import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const token = inject(AuthService).getToken();

  if (token) {
    return true;
  }

  return inject(Router).createUrlTree(['/login']);
};
