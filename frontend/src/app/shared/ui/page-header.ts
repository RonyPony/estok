import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({ selector: 'app-page-header', changeDetection: ChangeDetectionStrategy.OnPush, template: '<header class="page-heading"><div><span class="eyebrow">{{ eyebrow() }}</span><h1>{{ title() }}</h1><p>{{ subtitle() }}</p></div><div class="actions"><ng-content /></div></header>' })
export class AppPageHeader { readonly title = input.required<string>(); readonly subtitle = input(''); readonly eyebrow = input('TU NEGOCIO, EN ORDEN'); }
