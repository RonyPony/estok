import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, shareReplay, tap, catchError, throwError } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { AuthStateService } from './auth-state.service';
import { Session } from '../models/session';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly state = inject(AuthStateService);
  private readonly router = inject(Router);
  private refreshing?: Observable<Session>;
  refresh(): Observable<Session> {
    return this.refreshing ??= this.api.refresh().pipe(tap(s => this.state.session.set(s)), catchError(error => { this.state.session.set(null); return throwError(() => error); }), finalize(() => this.refreshing = undefined), shareReplay({ bufferSize: 1, refCount: false }));
  }
  logout(): void { this.api.logout().pipe(finalize(() => { this.state.session.set(null); void this.router.navigateByUrl('/login'); })).subscribe({ error: () => undefined }); }
}
