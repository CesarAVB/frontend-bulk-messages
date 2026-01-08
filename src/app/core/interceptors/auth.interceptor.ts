import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  const requestWithAuth = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requestWithAuth).pipe(
    catchError((error: unknown) => {
      const isUnauthorized =
        error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403);

      if (isUnauthorized) {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
