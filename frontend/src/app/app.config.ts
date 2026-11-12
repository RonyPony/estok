import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { firstValueFrom, catchError, of } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
export const appConfig: ApplicationConfig = { providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes), provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])), provideAppInitializer(() => firstValueFrom(inject(AuthService).restore().pipe(catchError(() => of(null)))))] };
