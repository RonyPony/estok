import { Component, inject, signal } from "@angular/core";
import { Api, Catalog, DatabaseInfo, message } from "./core";
import { Confirmation } from "./confirmation";
@Component({
  imports: [Confirmation],
  template: `
    <div class="page-heading">
      <div>
        <span class="eyebrow">MANTENIMIENTO</span>
        <h1>Base de datos</h1>
        <p>Conteos de registros, estado del esquema y limpieza de sesiones.</p>
      </div>
      <button (click)="load()" [disabled]="busy()">Actualizar conteos</button>
    </div>
    @if (notice()) {
      <p class="alert success" role="status">{{ notice() }}</p>
    }
    @if (error()) {
      <p class="alert error" role="alert">{{ error() }}</p>
    }
    @if (busy()) {
      <p role="status">Consultando la base de datos…</p>
    }
    @if (data(); as info) {
      <div class="stats-grid">
        <article class="stat featured">
          <span>Tablas</span><strong>{{ info.tables.length }}</strong
          ><small>incluye tablas de identidad</small>
        </article>
        <article class="stat">
          <span>Registros totales</span><strong>{{ total() }}</strong
          ><small>conteo de filas, incluidos eliminados</small>
        </article>
        <article class="stat">
          <span>Sesiones para limpiar</span
          ><strong>{{ info.cleanupCandidates }}</strong
          ><small>vencidas hace más de {{ info.retentionDays }} días</small>
        </article>
        <article class="stat">
          <span>Migraciones pendientes</span
          ><strong>{{ info.pendingMigrations.length }}</strong
          ><small>se aplican desde el despliegue</small>
        </article>
      </div>
      <section class="panel maintenance">
        <div>
          <h2>Limpieza de sesiones vencidas</h2>
          <p>
            Elimina hasta 1.000 sesiones por operación. Conserva sesiones
            vigentes y el historial de auditoría.
          </p>
        </div>
        <button
          class="primary"
          (click)="confirming.set(true)"
          [disabled]="
            busy() ||
            !catalog()?.allowSessionCleanup ||
            info.cleanupCandidates === 0
          "
        >
          Limpiar sesiones
        </button>
      </section>
      @if (info.pendingMigrations.length) {
        <section class="alert">
          <strong>Migraciones por aplicar</strong>
          @for (migration of info.pendingMigrations; track migration) {
            <p>{{ migration }}</p>
          }
        </section>
      }
      <section class="table-panel">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Tabla</th>
                <th class="numeric">Registros</th>
                <th class="numeric">Eliminados lógicamente</th>
              </tr>
            </thead>
            <tbody>
              @for (table of info.tables; track table.name) {
                <tr>
                  <td>{{ table.name }}</td>
                  <td class="numeric">{{ table.records }}</td>
                  <td class="numeric">{{ table.deleted }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
      <p class="muted small">
        Última consulta: {{ api.date(info.checkedAt) }}. Los conteos se obtienen
        tabla por tabla y pueden variar si hay operaciones simultáneas.
      </p>
    }
    @if (confirming()) {
      <bo-confirmation
        title="Limpiar sesiones vencidas"
        description="Se eliminará un lote de hasta 1.000 sesiones que cumplen el período de retención. La operación quedará auditada."
        confirmation="LIMPIAR SESIONES"
        [danger]="true"
        [busy]="saving()"
        [error]="saveError()"
        (cancel)="confirming.set(false)"
        (confirm)="cleanup($event)"
      />
    }
  `,
})
export class Database {
  readonly api = inject(Api);
  data = signal<DatabaseInfo | null>(null);
  catalog = signal<Catalog | null>(null);
  busy = signal(false);
  error = signal("");
  notice = signal("");
  confirming = signal(false);
  saving = signal(false);
  saveError = signal("");
  total() {
    return this.data()?.tables.reduce((sum, t) => sum + t.records, 0) || 0;
  }
  constructor() {
    void this.load();
  }
  async load() {
    this.busy.set(true);
    this.error.set("");
    try {
      const [data, catalog] = await Promise.all([
        this.api.get<DatabaseInfo>("/database"),
        this.api.get<Catalog>("/catalog"),
      ]);
      this.data.set(data);
      this.catalog.set(catalog);
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
  async cleanup(body: { reason: string; confirmation: string }) {
    if (this.saving()) return;
    this.saving.set(true);
    this.saveError.set("");
    try {
      const result = await this.api.post<{ message: string }>(
        "/database/cleanup-sessions",
        body,
      );
      this.notice.set(result.message);
      this.confirming.set(false);
      await this.load();
    } catch (e) {
      this.saveError.set(message(e));
    } finally {
      this.saving.set(false);
    }
  }
}
