import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AuthStateService } from '../../core/auth/auth-state.service';
@Component({ selector: 'app-money', changeDetection: ChangeDetectionStrategy.OnPush, template: '{{ formatted() }}' })
export class AppMoney {
  readonly amount = input(0); readonly currency = input<string>(); readonly locale = input('es-DO'); private readonly state = inject(AuthStateService);
  readonly formatted = computed(() => new Intl.NumberFormat(this.locale(), { style: 'currency', currency: this.currency() ?? this.state.currentBusiness()?.currency ?? 'DOP' }).format(this.amount()));
}
