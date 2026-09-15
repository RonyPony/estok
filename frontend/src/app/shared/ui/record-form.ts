import { Component, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
export interface FormField { key: string; label: string; type?: 'text' | 'number' | 'email' | 'password' | 'checkbox'; }
@Component({
  selector: 'app-record-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule, MatIconModule],
  template: `
    <div class="form-grid" [formGroup]="form()">
      @for (field of fields(); track field.key) {
        @if (field.type === 'checkbox') {
          <mat-checkbox [formControlName]="field.key">{{ field.label }}</mat-checkbox>
        } @else {
          <mat-form-field appearance="outline">
            <mat-label>{{ field.label }}</mat-label>
            <input matInput [type]="field.type === 'password' && visiblePasswords()[field.key] ? 'text' : (field.type ?? 'text')" [formControlName]="field.key" />
            @if (field.type === 'password') {
              <button mat-icon-button matSuffix type="button" (click)="togglePassword(field.key)"
                [attr.aria-label]="visiblePasswords()[field.key] ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                [attr.aria-pressed]="!!visiblePasswords()[field.key]">
                <mat-icon>{{ visiblePasswords()[field.key] ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            }
            <mat-error>Revisa este campo</mat-error>
          </mat-form-field>
        }
      }
    </div>
  `,
})
export class RecordFormComponent {
  readonly form = input.required<FormGroup>();
  readonly fields = input.required<FormField[]>();
  readonly visiblePasswords = signal<Record<string, boolean>>({});
  togglePassword(key: string): void {
    this.visiblePasswords.update(current => ({ ...current, [key]: !current[key] }));
  }
}
