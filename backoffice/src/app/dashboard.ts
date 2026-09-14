import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Api, message } from "./core";
interface Stats {
  users: number;
  activeUsers: number;
  recentlyActiveUsers: number;
  activityMinutes: number;
  pendingUsers: number;
  businesses: number;
  activeBusinesses: number;
  pendingMemberships: number;
  deletedRecords: number;
  auditActions: number;
}
@Component({
  imports: [RouterLink],
  template: `
    <div class="page-heading">
      <div>
        <span class="eyebrow">PLATAFORMA</span>
        <h1>Resumen operativo</h1>
        <p>Actividad, cuentas pendientes y registros por revisar.</p>
      </div>
      <button (click)="load()" [disabled]="busy()">Actualizar</button>
    </div>
    @if (error()) {
      <p class="alert error" role="alert">{{ error() }}</p>
    }
    @if (busy()) {
      <p role="status">Cargando indicadores…</p>
    }
    @if (stats(); as s) {
      <div class="stats-grid">
        <article class="stat featured">
          <span>Usuarios activos</span><strong>{{ s.activeUsers }}</strong
          ><small>de {{ s.users }} cuentas registradas</small>
        </article>
        <article class="stat">
          <span>Actividad reciente</span
          ><strong>{{ s.recentlyActiveUsers }}</strong
          ><small>en los últimos {{ s.activityMinutes }} minutos</small>
        </article>
        <article class="stat">
          <span>Negocios activos</span><strong>{{ s.activeBusinesses }}</strong
          ><small>de {{ s.businesses }} negocios</small>
        </article>
        <article class="stat">
          <span>Acciones auditadas</span><strong>{{ s.auditActions }}</strong
          ><small>negocios y backoffice</small>
        </article>
      </div>
      <div class="dashboard-columns">
        <section class="panel">
          <h2>Requieren revisión</h2>
          <a
            class="review-row"
            routerLink="/accounts"
            [queryParams]="{ active: 'false' }"
            ><span
              >Cuentas inactivas<small
                >Revisa los datos antes de activar</small
              ></span
            ><strong>{{ s.pendingUsers }}</strong
            ><span>→</span></a
          ><a
            class="review-row"
            routerLink="/businesses"
            [queryParams]="{ active: 'false' }"
            ><span
              >Negocios inactivos<small
                >Verifica la información del negocio</small
              ></span
            ><strong>{{ s.businesses - s.activeBusinesses }}</strong
            ><span>→</span></a
          ><a
            class="review-row"
            routerLink="/activation"
            [queryParams]="{ active: 'false' }"
            ><span
              >Membresías inactivas<small
                >Acceso del usuario a cada negocio</small
              ></span
            ><strong>{{ s.pendingMemberships }}</strong
            ><span>→</span></a
          ><a class="review-row" routerLink="/trash"
            ><span
              >Registros en la papelera<small
                >Restaurar o revisar el borrado definitivo</small
              ></span
            ><strong>{{ s.deletedRecords }}</strong
            ><span>→</span></a
          >
        </section>
        <section class="panel dark-panel">
          <span class="eyebrow">CONTROL DE ACCESO</span>
          <h2>Una activación completa tiene tres pasos.</h2>
          <ol>
            <li>Activar la cuenta del usuario.</li>
            <li>Activar el negocio.</li>
            <li>Activar su membresía y verificar el rol.</li>
          </ol>
          <p>
            Las cifras de inactivos incluyen registros pendientes de revisión y
            registros desactivados.
          </p>
          <a routerLink="/activation">Revisar activaciones →</a>
        </section>
      </div>
      <p class="muted small">
        La actividad indica solicitudes autenticadas exitosas, con precisión
        aproximada de un minuto; no representa conexiones en tiempo real.
      </p>
    }
  `,
})
export class Dashboard {
  private api = inject(Api);
  stats = signal<Stats | null>(null);
  busy = signal(false);
  error = signal("");
  constructor() {
    void this.load();
  }
  async load() {
    this.busy.set(true);
    this.error.set("");
    try {
      this.stats.set(await this.api.get<Stats>("/dashboard"));
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
}
