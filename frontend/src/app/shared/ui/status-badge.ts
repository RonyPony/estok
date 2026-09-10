import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({ selector: 'app-status-badge', changeDetection: ChangeDetectionStrategy.OnPush, template: '<span class="badge" [attr.data-tone]="tone()">{{ label() }}</span>' })
export class AppStatusBadge { readonly label = input.required<string>(); readonly tone = input<'success' | 'warning' | 'danger' | 'info' | 'neutral'>('neutral'); }
