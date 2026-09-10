import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthStateService } from '../core/auth/auth-state.service';
import { AuthService } from '../core/auth/auth.service';
import { branding } from '../core/config/branding';
@Component({ selector: 'app-layout', imports: [RouterLink, RouterLinkActive, RouterOutlet, MatIconModule, MatButtonModule, MatMenuModule], templateUrl: './app-layout.html', styleUrl: './app-layout.scss' })
export class AppLayoutComponent {
  readonly state = inject(AuthStateService); readonly auth = inject(AuthService); readonly brand = branding; readonly open = signal(false);
  readonly navigation = [
    { path: 'dashboard', label: 'Vista general', icon: 'space_dashboard', permission: 'reports.view' },
    { path: 'customers', label: 'Clientes', icon: 'people_outline', permission: 'customers.view' },
    { path: 'products', label: 'Productos', icon: 'inventory_2', permission: 'products.view' },
    { path: 'inventory', label: 'Inventario', icon: 'layers', permission: 'inventory.view' },
    { path: 'sales', label: 'Ventas', icon: 'shopping_bag', permission: 'sales.view' },
    { path: 'quotes', label: 'Presupuestos', icon: 'description', permission: 'quotes.view' },
    { path: 'accounts-receivable', label: 'Cuentas por cobrar', icon: 'account_balance_wallet', permission: 'payments.view' },
    { path: 'payments', label: 'Pagos', icon: 'payments', permission: 'payments.view' },
    { path: 'users', label: 'Equipo y accesos', icon: 'group_add', permission: 'users.view' },
    { path: 'settings', label: 'Configuración', icon: 'settings', permission: 'settings.view' },
  ];
}
