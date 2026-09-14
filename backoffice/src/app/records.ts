import { Component, DestroyRef, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { KeyValuePipe } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Api, Auth, Catalog, Page, RecordRow, labels, message } from "./core";
import { Confirmation } from "./confirmation";

@Component({
  imports: [FormsModule, RouterLink, Confirmation, KeyValuePipe],
  template: `
    <div class="page-heading">
      <div>
        <span class="eyebrow">ADMINISTRACIÓN</span>
        <h1>{{ title }}</h1>
        <p>
          {{
            trash
              ? "Recupera registros o revisa su eliminación definitiva."
              : "Revisa los registros y administra su estado de activación."
          }}
        </p>
      </div>
      <button (click)="load()" [disabled]="busy()">Actualizar</button>
    </div>
    @if (notice()) {
      <p class="alert success" role="status">{{ notice() }}</p>
    }
    @if (error()) {
      <p class="alert error" role="alert">{{ error() }}</p>
    }
    <form class="filters" (ngSubmit)="load(1)">
      @if (selectable) {
        <label
          >Tipo de registro<select
            name="entity"
            [(ngModel)]="entity"
            (ngModelChange)="load(1)"
          >
            @for (type of types(); track type.key) {
              <option [value]="type.key">
                {{ labels[type.key] || type.key }}
              </option>
            }
          </select></label
        >
      }
      <label class="grow"
        >Buscar<input
          name="search"
          [(ngModel)]="search"
          placeholder="Nombre, correo o ID del registro"
      /></label>
      @if (entity !== "ApplicationUser" && entity !== "Business") {
        <label
          >Negocio (ID)<input
            name="business"
            [(ngModel)]="businessId"
            placeholder="Todos los negocios"
        /></label>
      }
      @if (entity === "BusinessUser") {
        <label
          >Usuario (ID)<input
            name="user"
            [(ngModel)]="userId"
            placeholder="Todos los usuarios"
        /></label>
      }
      @if (!trash) {
        <label
          >Estado<select name="active" [(ngModel)]="active">
            <option value="">Todos</option>
            <option value="false">Inactivos</option>
            <option value="true">Activos</option>
          </select></label
        >
      }
      <button class="primary" [disabled]="busy()">Filtrar</button>
    </form>
    @if (busy()) {
      <p role="status">Cargando registros…</p>
    }
    <section class="table-panel">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Registro</th>
              @if (entity !== "Business" && entity !== "ApplicationUser") {
                <th>Negocio / relación</th>
              }
              <th>Estado</th>
              <th>
                {{
                  trash
                    ? "Eliminado el"
                    : entity === "ApplicationUser"
                      ? "Última actividad"
                      : "Creado el"
                }}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (row of data()?.items || []; track row.id) {
              <tr>
                <td>
                  <strong>{{ row.userName || row.name }}</strong>
                  @if (row.email) {
                    <small>{{ row.email }}</small>
                  }
                  @if (row.roleName) {
                    <small>{{ row.roleName }}</small>
                  }
                  <small class="mono break">{{ row.id }}</small>
                </td>
                @if (entity !== "Business" && entity !== "ApplicationUser") {
                  <td>
                    <a
                      routerLink="/businesses"
                      [queryParams]="{ search: row.businessId }"
                      [title]="row.businessId || ''"
                      >{{ row.businessName || row.businessId }}</a
                    >
                    @if (row.userId) {
                      <small
                        >Usuario:
                        <a
                          routerLink="/accounts"
                          [queryParams]="{ search: row.userId }"
                          >{{ row.userName || row.userId }}</a
                        ></small
                      >
                    }
                  </td>
                }
                <td>
                  <span
                    class="badge"
                    [class.active]="row.isActive && !row.isDeleted"
                    [class.deleted]="row.isDeleted"
                    >{{
                      row.isDeleted
                        ? "Eliminado"
                        : row.isActive
                          ? "Activo"
                          : "Inactivo"
                    }}</span
                  >
                </td>
                <td>
                  {{
                    api.date(
                      trash
                        ? row.deletedAt
                        : entity === "ApplicationUser"
                          ? row.lastActivityAt
                          : row.createdAt
                    )
                  }}
                  @if (trash && row.deletedBy) {
                    <small>Por {{ row.deletedBy }}</small>
                  }
                </td>
                <td>
                  <div class="row-actions">
                    @if (trash) {
                      <button (click)="ask(row, 'restore')" [disabled]="busy()">
                        Restaurar</button
                      ><button
                        class="danger-link"
                        (click)="ask(row, 'purge')"
                        [disabled]="
                          !catalog()?.allowPermanentDeletion || busy()
                        "
                        title="Requiere habilitar el borrado definitivo en el servidor"
                      >
                        Borrar definitivamente
                      </button>
                    } @else {
                      <button
                        (click)="ask(row, 'activation')"
                        [disabled]="
                          busy() ||
                          (row.id === auth.session()?.user?.id && row.isActive)
                        "
                      >
                        {{ row.isActive ? "Desactivar" : "Activar" }}
                      </button>
                    }
                    <button (click)="detail.set(row)">Detalles</button>
                    @if (entity === "ApplicationUser") {
                      <a routerLink="/audit" [queryParams]="{ userId: row.id }"
                        >Auditoría</a
                      ><a
                        routerLink="/activation"
                        [queryParams]="{ userId: row.id }"
                        >Membresías</a
                      >
                    }
                    @if (entity === "Business") {
                      <a
                        routerLink="/activation"
                        [queryParams]="{ businessId: row.id }"
                        >Membresías</a
                      >
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty">
                  {{
                    busy()
                      ? "Consultando datos…"
                      : "No hay registros para estos filtros."
                  }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span
          >{{ data()?.totalItems || 0 }} registros · Página {{ page }} de
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
    @if (trash) {
      <p class="muted small">
        El borrado definitivo solo se permite si no existen referencias al
        registro. Las ventas, los pagos, los movimientos y las auditorías se
        conservan.
      </p>
    }
    @if (detail(); as row) {
      <section class="panel detail">
        <div class="page-heading">
          <h2>Detalles del registro</h2>
          <button (click)="detail.set(null)">Cerrar detalles</button>
        </div>
        <dl>
          <dt>Nombre</dt>
          <dd>{{ row.name }}</dd>
          <dt>ID</dt>
          <dd>{{ row.id }}</dd>
          <dt>Correo</dt>
          <dd>{{ row.email || "No registrado" }}</dd>
          <dt>Negocio</dt>
          <dd>{{ row.businessId || "Cuenta o registro global" }}</dd>
          <dt>Usuario relacionado</dt>
          <dd>{{ row.userId || "No aplica" }}</dd>
          <dt>Rol</dt>
          <dd>
            @if (row.roleId) {
              <a
                routerLink="/activation"
                [queryParams]="{
                  entity: 'Role',
                  search: row.roleId,
                  businessId: row.businessId,
                }"
                >{{ row.roleId }}</a
              >
            } @else {
              No aplica
            }
          </dd>
          <dt>Creación</dt>
          <dd>{{ api.date(row.createdAt) }}</dd>
          <dt>Última modificación</dt>
          <dd>
            {{ row.updatedAt ? api.date(row.updatedAt) : "Sin modificaciones" }}
          </dd>
          @for (field of row.reviewFields | keyvalue; track field.key) {
            <dt>{{ fieldLabels[field.key] || field.key }}</dt>
            <dd>
              {{
                field.value === "True"
                  ? "Sí"
                  : field.value === "False"
                    ? "No"
                    : field.value || "No registrado"
              }}
            </dd>
          }
        </dl>
      </section>
    }
    @if (pending(); as p) {
      <bo-confirmation
        [title]="p.title"
        [description]="p.description"
        [confirmation]="p.row.id"
        [danger]="
          p.action === 'purge' ||
          (p.action === 'activation' && !!p.row.isActive)
        "
        [busy]="saving()"
        [error]="saveError()"
        (cancel)="pending.set(null)"
        (confirm)="save($event)"
      />
    }
  `,
})
export class Records {
  readonly api = inject(Api);
  readonly auth = inject(Auth);
  readonly labels = labels;
  private route = inject(ActivatedRoute);
  private destroy = inject(DestroyRef);
  private generation = 0;
  title = this.route.snapshot.data["title"];
  trash = !!this.route.snapshot.data["trash"];
  entity: string = this.route.snapshot.data["entity"];
  selectable = this.trash || this.title === "Activaciones";
  search = "";
  businessId = "";
  userId = "";
  active = "";
  page = 1;
  readonly fieldLabels: Record<string, string> = {
    LegalName: "Razón social",
    TaxId: "Identificación fiscal",
    Phone: "Teléfono",
    Address: "Dirección",
    Country: "País",
    Currency: "Moneda",
    TimeZone: "Zona horaria",
    IsOwner: "Propietario",
    IsSystemRole: "Rol del sistema",
    Code: "Código",
    Sku: "SKU",
  };
  data = signal<Page<RecordRow> | null>(null);
  catalog = signal<Catalog | null>(null);
  busy = signal(false);
  error = signal("");
  notice = signal("");
  detail = signal<RecordRow | null>(null);
  pending = signal<{
    row: RecordRow;
    action: string;
    title: string;
    description: string;
  } | null>(null);
  saving = signal(false);
  saveError = signal("");
  types() {
    return (this.catalog()?.entities || []).filter((t) =>
      this.trash ? t.canRestore : t.canActivate,
    );
  }
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      this.search = p.get("search") || "";
      this.businessId = p.get("businessId") || "";
      this.userId = p.get("userId") || "";
      this.active = p.get("active") || "";
      if (this.selectable)
        this.entity = p.get("entity") || this.route.snapshot.data["entity"];
      void this.load(1);
    });
    this.destroy.onDestroy(() => this.generation++);
  }
  async load(page = this.page) {
    const generation = ++this.generation;
    this.busy.set(true);
    this.error.set("");
    this.detail.set(null);
    const params: Record<string, string | number | boolean> = {
      page,
      size: this.api.config.pageSize,
      search: this.search,
      deleted: this.trash,
    };
    if (this.businessId) params["businessId"] = this.businessId;
    if (this.userId && this.entity === "BusinessUser")
      params["userId"] = this.userId;
    if (this.active !== "" && !this.trash) params["active"] = this.active;
    try {
      const [catalog, data] = await Promise.all([
        this.catalog()
          ? Promise.resolve(this.catalog()!)
          : this.api.get<Catalog>("/catalog"),
        this.api.get<Page<RecordRow>>("/records/" + this.entity, params),
      ]);
      if (generation === this.generation) {
        this.catalog.set(catalog);
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
  ask(row: RecordRow, action: string) {
    this.saveError.set("");
    this.pending.set({
      row,
      action,
      title:
        action === "purge"
          ? "Borrar definitivamente"
          : action === "restore"
            ? "Restaurar registro"
            : row.isActive
              ? "Desactivar registro"
              : "Activar registro",
      description: `${row.name}. ${action === "purge" ? "Esta operación es irreversible y se bloqueará si hay registros relacionados." : "El cambio quedará registrado con tu usuario y el motivo indicado."}`,
    });
  }
  async save(body: { reason: string; confirmation: string }) {
    const p = this.pending();
    if (!p || this.saving()) return;
    this.saving.set(true);
    this.saveError.set("");
    try {
      const response = await this.api.post<{ message: string }>(
        `/records/${this.entity}/${p.row.id}/${p.action}`,
        { ...body, active: !p.row.isActive },
      );
      this.pending.set(null);
      this.notice.set(response.message);
      await this.load();
    } catch (e) {
      this.saveError.set(message(e));
    } finally {
      this.saving.set(false);
    }
  }
}
