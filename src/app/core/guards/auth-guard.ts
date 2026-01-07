import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    localStorage.removeItem('isAuthenticated');
    router.navigate(['/login']);
    return false;
  }
  
  return true;
};
