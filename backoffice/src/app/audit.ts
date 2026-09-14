import { Component, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Api, AuditRow, Page, labels, message } from "./core";
@Component({
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page-heading">
      <div>
        <span class="eyebrow">TRAZABILIDAD</span>
        <h1>Auditoría</h1>
        <p>Acciones de los negocios y del backoffice, con su autor y fecha.</p>
      </div>
      <button [disabled]="busy()" (click)="load()">Actualizar</button>
    </div>
    <form class="filters" (ngSubmit)="load(1)">
      <label
        >Usuario (ID)<input
          name="user"
          [(ngModel)]="userId"
          placeholder="Todos los usuarios" /></label
      ><label
        >Negocio (ID)<input
          name="business"
          [(ngModel)]="businessId"
          placeholder="Todos los negocios" /></label
      ><label
        >Acción<select name="action" [(ngModel)]="action">
          <option value="">Todas</option>
          @for (item of actions; track item.key) {
            <option [value]="item.key">{{ item.label }}</option>
          }
        </select></label
      ><label>Desde<input type="date" name="from" [(ngModel)]="from" /></label
      ><label>Hasta<input type="date" name="to" [(ngModel)]="to" /></label
      ><button class="primary" [disabled]="busy()">Filtrar</button>
    </form>
    @if (error()) {
      <p role="alert" class="alert error">{{ error() }}</p>
    }
    @if (busy()) {
      <p role="status">Cargando auditoría…</p>
    }
    <section class="table-panel">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Fecha / origen</th>
              <th>Autor / negocio</th>
              <th>Acción / registro</th>
              <th>Motivo y cambio</th>
            </tr>
          </thead>
          <tbody>
            @for (row of data()?.items || []; track row.id) {
              <tr>
                <td>
                  {{ api.date(row.createdAt) }}<small>{{ row.source }}</small>
                </td>
                <td>
                  <a
                    routerLink="/accounts"
                    [queryParams]="{ search: row.userId }"
                    [title]="row.userId || ''"
                    >{{ row.userName || row.userId || "Sistema" }}</a
                  ><small>{{
                    row.businessName || row.businessId || "Global"
                  }}</small>
                </td>
                <td>
                  <strong>{{ actionLabel(row.action) }}</strong
                  ><small
                    >{{ labels[row.entityName] || row.entityName }} ·
                    {{ row.entityId }}</small
                  >
                </td>
                <td>
                  {{ row.reason || "Auditoría del negocio" }}
                  @if (row.previousValue || row.newValue) {
                    <small
                      >{{ row.previousValue || "—" }} →
                      {{ row.newValue || "—" }}</small
                    >
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="empty">
                  {{
                    busy()
                      ? "Consultando datos…"
                      : "No hay acciones para estos filtros."
                  }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span
          >{{ data()?.totalItems || 0 }} acciones · Página {{ page }} de
          {{ data()?.totalPages || 1 }}</span
        ><button [disabled]="busy() || page <= 1" (click)="load(page - 1)">
          Anterior</button
        ><button
          [disabled]="busy() || page >= (data()?.totalPages || 1)"
          (click)="load(page + 1)"
        >
          Siguiente
        </button>
      </div>
    </section>
  `,
})
export class Audit {
  readonly api = inject(Api);
  labels = labels;
  private route = inject(ActivatedRoute);
  private destroy = inject(DestroyRef);
  private generation = 0;
  userId = this.route.snapshot.queryParamMap.get("userId") || "";
  businessId = "";
  action = "";
  from = "";
  to = "";
  page = 1;
  busy = signal(false);
  error = signal("");
  data = signal<Page<AuditRow> | null>(null);
  actions = [
    { key: "Added", label: "Creación" },
    { key: "Modified", label: "Modificación" },
    { key: "SoftDeleted", label: "Borrado lógico" },
    { key: "activation", label: "Activación / desactivación" },
    { key: "restore", label: "Restauración" },
    { key: "purge", label: "Borrado definitivo" },
    { key: "login", label: "Inicio de sesión" },
    { key: "cleanup", label: "Mantenimiento" },
  ];
  actionLabel(key: string) {
    return this.actions.find((a) => a.key === key)?.label || key;
  }
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      this.userId = p.get("userId") || "";
      this.businessId = p.get("businessId") || "";
      this.action = p.get("action") || "";
      void this.load(1);
    });
    this.destroy.onDestroy(() => this.generation++);
  }
  async load(page = this.page) {
    const generation = ++this.generation;
    this.busy.set(true);
    this.error.set("");
    const params: Record<string, string | number> = {
      page,
      size: this.api.config.pageSize,
    };
    if (this.userId) params["userId"] = this.userId;
    if (this.businessId) params["businessId"] = this.businessId;
    if (this.action) params["action"] = this.action;
    if (this.from)
      params["from"] = new Date(this.from + "T00:00:00").toISOString();
    if (this.to)
      params["to"] = new Date(this.to + "T23:59:59.999").toISOString();
    try {
      const data = await this.api.get<Page<AuditRow>>("/audit", params);
      if (generation === this.generation) {
        this.data.set(data);
        this.page = page;
      }
    } catch (e) {
      if (generation === this.generation) {
        this.error.set(message(e));
        this.data.set(null);
      }
    } finally {
      if (generation === this.generation) this.busy.set(false);
    }
  }
}
