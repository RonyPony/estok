import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthStateService } from '../auth/auth-state.service';
import { AuthService } from '../auth/auth.service';
export const authGuard: CanActivateFn = () => {
  const state = inject(AuthStateService); const router = inject(Router);
  return state.session() ? true : inject(AuthService).refresh().pipe(map(() => true), catchError(() => of(router.createUrlTree(['/login']))));
};
export const guestGuard: CanActivateFn = () => {
 const state=inject(AuthStateService);const router=inject(Router);
 const destination=()=>router.createUrlTree(['/dashboard']);
 return state.session()?destination():inject(AuthService).refresh().pipe(map(destination),catchError(()=>of(true)));
};
export const permissionGuard: CanActivateFn = route => inject(AuthStateService).has(route.data['permission'] as string) || inject(Router).createUrlTree(['/forbidden']);
