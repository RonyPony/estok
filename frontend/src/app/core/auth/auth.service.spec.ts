import { TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthStateService } from './auth-state.service';
import { Session } from '../models/session';

describe('AuthService refresh coordination', () => {
  let http: HttpTestingController;
  let auth: AuthService;
  const session: Session = { accessToken: 'test-token', user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' }, business: { id: '2', name: 'Test business', currency: 'DOP', country: 'DO', timeZone: 'America/Santo_Domingo' }, permissions: ['products.view'] };
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }); http = TestBed.inject(HttpTestingController); auth = TestBed.inject(AuthService); });
  afterEach(() => http.verify());
  it('shares one refresh request between simultaneous subscribers', () => {
    const received: Session[] = [];
    auth.refresh().subscribe(value => received.push(value));
    auth.refresh().subscribe(value => received.push(value));
    const request = http.expectOne('/api/auth/refresh');
    expect(request.request.withCredentials).toBe(true);
    request.flush(session);
    expect(received).toEqual([session, session]);
    expect(TestBed.inject(AuthStateService).session()).toEqual(session);
    auth.refresh().subscribe();
    http.expectOne('/api/auth/refresh').flush(session);
  });
  it('clears authentication after refresh rejection', () => {
    TestBed.inject(AuthStateService).session.set(session);
    let rejected = false;
    auth.refresh().subscribe({ error: () => rejected = true });
    http.expectOne('/api/auth/refresh').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(rejected).toBe(true);
    expect(TestBed.inject(AuthStateService).session()).toBeNull();
  });
});
