import { inject, Pipe, PipeTransform } from '@angular/core';
import { AuthStateService } from '../../core/auth/auth-state.service';
@Pipe({ name: 'businessDate' })
export class BusinessDatePipe implements PipeTransform {
  private readonly state = inject(AuthStateService);
  transform(value: string): string { return new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium', timeZone: this.state.currentBusiness()?.timeZone ?? 'UTC' }).format(new Date(value.endsWith('Z') ? value : value + 'Z')); }
}
