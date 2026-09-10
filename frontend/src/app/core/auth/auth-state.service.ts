import { Injectable, computed, signal } from '@angular/core';
import { Session } from '../models/session';
@Injectable({ providedIn: 'root' })
export class AuthStateService {
  readonly session = signal<Session | null>(null);
  readonly currentUser = computed(() => this.session()?.user);
  readonly currentBusiness = computed(() => this.session()?.business);
  readonly permissions = computed(() => this.session()?.permissions ?? []);
  has(permission: string): boolean { return this.permissions().includes(permission); }
}
