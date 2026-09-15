import { TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthStateService } from './auth-state.service';
import { Session } from '../models/session';
import { environment } from '../../../environments/environment';
import { authGuard, guestGuard } from '../guards/auth.guard';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { isObservable } from 'rxjs';

describe('AuthService refresh coordination', () => {
  let http: HttpTestingController;
  let auth: AuthService;
  const session: Session = { accessToken: 'test-token', user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' }, business: { id: '2', name: 'Test business', currency: 'DOP', country: 'DO', timeZone: 'America/Santo_Domingo' }, permissions: ['products.view'] };
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), provideRouter([])] }); http = TestBed.inject(HttpTestingController); auth = TestBed.inject(AuthService); });
  afterEach(() => http.verify());
  it('shares one refresh request between simultaneous subscribers', () => {
    const received: Session[] = [];
    auth.refresh().subscribe(value => received.push(value));
    auth.refresh().subscribe(value => received.push(value));
    const request = http.expectOne(`${environment.apiBaseUrl}/auth/refresh`);
    expect(request.request.withCredentials).toBe(true);
    request.flush(session);
    expect(received).toEqual([session, session]);
    expect(TestBed.inject(AuthStateService).session()).toEqual(session);
    auth.refresh().subscribe();
    http.expectOne(`${environment.apiBaseUrl}/auth/refresh`).flush(session);
  });
  it('clears authentication after refresh rejection', () => {
    TestBed.inject(AuthStateService).session.set(session);
    let rejected = false;
    auth.refresh().subscribe({ error: () => rejected = true });
    http.expectOne(`${environment.apiBaseUrl}/auth/refresh`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(rejected).toBe(true);
    expect(TestBed.inject(AuthStateService).session()).toBeNull();
  });
  it('allows public pages immediately without requesting a session', () => {
    const result = TestBed.runInInjectionContext(() => guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    expect(result).toBe(true);
    http.expectNone(`${environment.apiBaseUrl}/auth/refresh`);
  });
  it('redirects an authenticated visitor without refreshing', () => {
    TestBed.inject(AuthStateService).session.set(session);
    const result = TestBed.runInInjectionContext(() => guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    expect(TestBed.inject(Router).serializeUrl(result as import('@angular/router').UrlTree)).toBe('/dashboard');
    http.expectNone(`${environment.apiBaseUrl}/auth/refresh`);
  });
  it('still restores a persistent session when entering a protected page', () => {
    const result = TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    expect(isObservable(result)).toBe(true);
    if (isObservable(result)) result.subscribe(value => expect(value).toBe(true));
    http.expectOne(`${environment.apiBaseUrl}/auth/refresh`).flush(session);
  });
  it('does not refresh or navigate after an anonymous request receives a 401', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    TestBed.inject(HttpClient).get(`${environment.apiBaseUrl}/public`).subscribe({ error: error => expect(error.status).toBe(401) });
    http.expectOne(`${environment.apiBaseUrl}/public`).flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectNone(`${environment.apiBaseUrl}/auth/refresh`);
    expect(navigate).not.toHaveBeenCalled();
  });
  it('refreshes and retries an authenticated request after a 401', () => {
    TestBed.inject(AuthStateService).session.set(session);
    TestBed.inject(HttpClient).get(`${environment.apiBaseUrl}/products`).subscribe();
    const initial = http.expectOne(`${environment.apiBaseUrl}/products`);
    expect(initial.request.headers.get('Authorization')).toBe('Bearer test-token');
    initial.flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(`${environment.apiBaseUrl}/auth/refresh`).flush({ ...session, accessToken: 'renewed-token' });
    const retry = http.expectOne(`${environment.apiBaseUrl}/products`);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer renewed-token');
    retry.flush([]);
  });
});
