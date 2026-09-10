import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notifications = inject(NotificationService);
  return next(request).pipe(catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && error.status !== 401) {
      const body: unknown = error.error;
      const message = typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string' ? body.message : error.status === 403 ? 'No tienes permiso para esta acción.' : error.status === 404 ? 'No se encontró el recurso.' : 'No pudimos conectar. Intenta nuevamente.';
      notifications.error(message);
    }
    return throwError(() => error);
  }));
};
