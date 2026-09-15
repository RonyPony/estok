import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { Session } from '../../core/models/session';
import { AuthPageComponent } from './auth-page';

describe('Registration review flow', () => {
  let http: HttpTestingController;
  const route = { snapshot: { data: { register: true } } };
  const request = {
    email: 'owner@example.com', password: 'StrongPassword123!', firstName: 'Test',
    lastName: 'Owner', businessName: 'Mi negocio', country: 'DO', currency: 'DOP',
  };

  beforeEach(() => {
    route.snapshot.data.register = true;
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: ActivatedRoute, useValue: route }],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it.each([false, true])('toggles password visibility without submitting (register=%s)', (register) => {
    route.snapshot.data.register = register;
    const fixture = TestBed.createComponent(AuthPageComponent);
    fixture.componentInstance.form.patchValue(request);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const input = element.querySelector<HTMLInputElement>('input[formControlName="password"]')!;
    const toggle = element.querySelector<HTMLButtonElement>('button[aria-label="Mostrar contraseña"]')!;
    expect(input.type).toBe('password');
    expect(toggle.type).toBe('button');
    toggle.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Ocultar contraseña');
    toggle.click();
    fixture.detectChanges();
    expect(input.type).toBe('password');
    expect(input.value).toBe(request.password);
    http.expectNone(() => true);
  });

  it('shows the pending review confirmation without creating a session or navigating to the dashboard', () => {
    const fixture = TestBed.createComponent(AuthPageComponent);
    const component = fixture.componentInstance;
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    fixture.detectChanges();
    component.form.setValue(request);
    component.submit();
    const registration = http.expectOne(`${environment.apiBaseUrl}/auth/register`);
    expect(registration.request.body).toEqual(request);
    registration.flush({ status: 'pending_review', message: 'Revisaremos tu información y te contactaremos para activar tu cuenta.' });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[role="status"]')?.textContent).toContain('pendiente de revisión');
    expect(element.textContent).toContain(request.email);
    expect(element.textContent).toContain('te contactaremos');
    expect(element.querySelector('form')).toBeNull();
    expect(component.form.controls.password.value).toBe('');
    expect(TestBed.inject(AuthStateService).session()).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
    component.submit();
    http.expectNone(`${environment.apiBaseUrl}/auth/register`);
  });

  it('keeps failed registrations editable and does not show a success confirmation', () => {
    const fixture = TestBed.createComponent(AuthPageComponent);
    fixture.componentInstance.form.setValue(request);
    fixture.componentInstance.submit();
    http.expectOne(`${environment.apiBaseUrl}/auth/register`).flush(
      { code: 'REGISTRATION_FAILED', message: 'El correo ya está registrado.' },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('form')).not.toBeNull();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('El correo ya está registrado.');
    expect(fixture.componentInstance.registrationMessage()).toBe('');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('rejects registration passwords shorter than the API minimum', () => {
    const fixture = TestBed.createComponent(AuthPageComponent);
    fixture.componentInstance.form.setValue({ ...request, password: 'Short1!' });
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.form.controls.password.invalid).toBe(true);
    http.expectNone(`${environment.apiBaseUrl}/auth/register`);
  });

  it('shows the inactive account message when login is denied', () => {
    route.snapshot.data.register = false;
    const fixture = TestBed.createComponent(AuthPageComponent);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    fixture.componentInstance.form.patchValue(request);
    fixture.componentInstance.submit();
    http.expectOne(`${environment.apiBaseUrl}/auth/login`).flush(
      { code: 'ACCOUNT_INACTIVE', message: 'Tu cuenta está inactiva. Te contactaremos para activarla.' },
      { status: 403, statusText: 'Forbidden' },
    );
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent).toContain('Te contactaremos');
    expect(TestBed.inject(AuthStateService).session()).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('continues to the dashboard when an activated account logs in', () => {
    route.snapshot.data.register = false;
    const fixture = TestBed.createComponent(AuthPageComponent);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.componentInstance.form.patchValue(request);
    fixture.componentInstance.submit();
    const session: Session = {
      accessToken: 'test-token', user: { id: '1', firstName: 'Test', lastName: 'Owner', email: request.email },
      business: { id: '2', name: request.businessName, currency: 'DOP', country: 'DO', timeZone: 'America/Santo_Domingo' },
      permissions: [],
    };
    http.expectOne(`${environment.apiBaseUrl}/auth/login`).flush(session);
    expect(TestBed.inject(AuthStateService).session()).toEqual(session);
    expect(navigate).toHaveBeenCalledWith('/dashboard');
  });
});
