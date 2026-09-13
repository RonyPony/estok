import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../core/auth/auth-api.service';
import { AuthStateService } from '../../core/auth/auth-state.service';
@Component({
  selector: 'app-auth-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  templateUrl: './auth-page.html',
})
export class AuthPageComponent {
  readonly register = inject(ActivatedRoute).snapshot.data['register'] === true;
  private readonly api = inject(AuthApiService);
  private readonly state = inject(AuthStateService);
  private readonly router = inject(Router);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(5)]],
    firstName: [''],
    lastName: [''],
    businessName: [''],
    country: ['DO'],
    currency: ['DOP'],
  });
  constructor() {
    if (this.register)
      for (const field of ['firstName', 'lastName', 'businessName'] as const)
        this.form.controls[field].addValidators(Validators.required);
  }
  submit() {
    debugger;
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    const request = this.form.getRawValue();
    (this.register ? this.api.register(request) : this.api.login(request))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (session) => {
          this.state.session.set(session);
          void this.router.navigateByUrl('/dashboard');
        },
        error: () =>
          this.error.set('No pudimos continuar. Revisa tus datos y la conexión con el servidor.'),
      });
  }
}
