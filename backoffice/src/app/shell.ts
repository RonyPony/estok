import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Auth, SETTINGS } from "./core";
@Component({
  selector: "bo-shell",
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (auth.session(); as session) {
      <div class="workspace">
        <aside>
          <a class="brand" routerLink="/dashboard"
            ><span class="brand-mark">e</span
            ><span>eStok<small>BACKOFFICE</small></span></a
          >
          <div class="nav-caption">ADMINISTRACIÓN</div>
          <nav aria-label="Navegación principal">
            @for (item of navigation; track item.path) {
              <a [routerLink]="item.path" routerLinkActive="selected"
                ><span aria-hidden="true" class="nav-symbol">{{
                  item.icon
                }}</span
                >{{ item.label }}</a
              >
            }
          </nav>
          <div class="sidebar-footer">
            <strong>{{ session.user.firstName || "Administrador" }}</strong
            ><span>{{ session.user.email }}</span
            ><button class="quiet" (click)="auth.logout()">
              Cerrar sesión
            </button>
          </div>
        </aside>
        <div class="main-area">
          <header class="topbar">
            <span>{{ settings.applicationName }}</span
            ><span class="scope">Administración global</span>
          </header>
          <main><router-outlet /></main>
        </div>
      </div>
    }
  `,
})
export class Shell {
  readonly auth = inject(Auth);
  readonly settings = inject(SETTINGS);
  readonly navigation = [
    { path: "/dashboard", icon: "◫", label: "Resumen" },
    { path: "/accounts", icon: "○", label: "Cuentas" },
    { path: "/businesses", icon: "▤", label: "Negocios" },
    { path: "/activation", icon: "✓", label: "Activaciones" },
    { path: "/trash", icon: "↺", label: "Papelera" },
    { path: "/audit", icon: "≡", label: "Auditoría" },
    { path: "/database", icon: "▥", label: "Base de datos" },
  ];
}
