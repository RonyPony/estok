import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthStateService } from '../../core/auth/auth-state.service';
@Directive({ selector: '[hasPermission]' })
export class HasPermission {
  readonly hasPermission = input.required<string>();
  private readonly state = inject(AuthStateService); private readonly template = inject(TemplateRef<unknown>); private readonly container = inject(ViewContainerRef);
  constructor() { effect(() => { this.container.clear(); if (this.state.has(this.hasPermission())) this.container.createEmbeddedView(this.template); }); }
}
