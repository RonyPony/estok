import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, Session } from '../models/session';
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  login(request: LoginRequest) {
    return this.http.post<Session>(`${environment.apiBaseUrl}/auth/login`, request, {
      withCredentials: true,
    });
  }
  register(request: RegisterRequest) {
    return this.http.post<Session>(`${environment.apiBaseUrl}/auth/register`, request, {
      withCredentials: true,
    });
  }
  refresh() {
    return this.http.post<Session>(
      `${environment.apiBaseUrl}/auth/refresh`,
      {},
      { withCredentials: true },
    );
  }
  logout() {
    return this.http.post<void>(
      `${environment.apiBaseUrl}/auth/logout`,
      {},
      { withCredentials: true },
    );
  }
}
