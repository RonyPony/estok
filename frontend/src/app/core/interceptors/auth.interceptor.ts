import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStateService } from '../auth/auth-state.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const state = inject(AuthStateService); const auth = inject(AuthService); const router = inject(Router);
  if (!request.url.startsWith(environment.apiBaseUrl) || request.url.includes('/auth/')) return next(request);
  const token = state.session()?.accessToken;
  const authorized = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(authorized).pipe(catchError((error: unknown) => {
    if (!token || !(error instanceof HttpErrorResponse) || error.status !== 401) return throwError(() => error);
    return auth.refresh().pipe(catchError(refreshError => { void router.navigateByUrl('/login'); return throwError(() => refreshError); }), switchMap(session => next(request.clone({ setHeaders: { Authorization: `Bearer ${session.accessToken}` } }))));
  }));
};
