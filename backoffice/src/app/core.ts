import { Injectable, InjectionToken, inject, signal } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
} from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, firstValueFrom, throwError, timeout } from "rxjs";

export interface AppSettings {
  applicationName: string;
  apiBaseUrl: string;
  pageSize: number;
  requestTimeoutMs: number;
  locale: string;
  timeZone: string;
}
export const SETTINGS = new InjectionToken<AppSettings>("appsettings");
export interface Session {
  accessToken: string;
  expiresAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}
export interface EntityType {
  key: string;
  canActivate: boolean;
  canRestore: boolean;
  tenantScoped: boolean;
}
export interface Catalog {
  entities: EntityType[];
  allowPermanentDeletion: boolean;
  allowSessionCleanup: boolean;
}
export interface Page<T> {
  items: T[];
  pageNumber: number;
  totalItems: number;
  totalPages: number;
}
export interface RecordRow {
  id: string;
  name: string;
  businessId: string | null;
  isActive: boolean | null;
  isDeleted: boolean;
  email: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  userId: string | null;
  roleId: string | null;
  lastActivityAt: string | null;
  reviewFields: Record<string, string | null>;
  businessName: string | null;
  userName: string | null;
  roleName: string | null;
}
export interface AuditRow {
  id: string;
  userId: string | null;
  businessId: string | null;
  entityName: string;
  entityId: string;
  action: string;
  createdAt: string;
  source: string;
  reason: string | null;
  previousValue: string | null;
  newValue: string | null;
  userName: string | null;
  businessName: string | null;
}
export interface DatabaseInfo {
  provider: string;
  checkedAt: string;
  tables: { name: string; records: number; deleted: number }[];
  pendingMigrations: string[];
  retentionDays: number;
  cleanupCandidates: number;
}
export const labels: Record<string, string> = {
  ApplicationUser: "Cuentas",
  Business: "Negocios",
  BusinessUser: "Membresías",
  Role: "Roles",
  Customer: "Clientes",
  Product: "Productos",
  ProductCategory: "Categorías",
  Warehouse: "Almacenes",
  PaymentMethod: "Métodos de pago",
};

@Injectable({ providedIn: "root" })
export class Auth {
  readonly session = signal<Session | null>(null);
  private timer?: ReturnType<typeof setTimeout>;
  private router = inject(Router);
  set(session: Session) {
    const expiresAt = Date.parse(session?.expiresAt);
    if (
      !session?.accessToken ||
      !session?.user?.id ||
      !Number.isFinite(expiresAt) ||
      expiresAt <= Date.now()
    ) {
      throw new Error(
        "La API no devolvió una sesión administrativa válida. Revisa que la URL configurada termine en /api/backoffice.",
      );
    }
    this.session.set(session);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.logout(), expiresAt - Date.now());
  }
  isAuthenticated() {
    const session = this.session();
    return !!session && Date.parse(session.expiresAt) > Date.now();
  }
  logout() {
    this.session.set(null);
    clearTimeout(this.timer);
    void this.router.navigateByUrl("/login");
  }
}

export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const config = inject(SETTINGS);
  if (!req.url.startsWith(config.apiBaseUrl + "/")) return next(req);
  const token = auth.session()?.accessToken;
  if (token)
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(req).pipe(
    timeout(config.requestTimeoutMs),
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        [401, 403].includes(error.status) &&
        req.method === "GET"
      )
        auth.logout();
      return throwError(() => error);
    }),
  );
};

@Injectable({ providedIn: "root" })
export class Api {
  private http = inject(HttpClient);
  readonly config = inject(SETTINGS);
  get<T>(path: string, params: Record<string, string | number | boolean> = {}) {
    return firstValueFrom(
      this.http.get<T>(this.config.apiBaseUrl + path, { params }),
    );
  }
  post<T>(path: string, body: unknown) {
    return firstValueFrom(
      this.http.post<T>(this.config.apiBaseUrl + path, body),
    );
  }
  date(value: string | null | undefined) {
    return value
      ? new Intl.DateTimeFormat(this.config.locale, {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: this.config.timeZone,
        }).format(new Date(value))
      : "Sin actividad registrada";
  }
}
export function message(error: unknown): string {
  return error instanceof HttpErrorResponse
    ? (error.error?.message ??
        (error.status === 0
          ? "No se pudo conectar con la API."
          : "No se pudo completar la solicitud."))
    : error instanceof Error && error.message.startsWith("La API no devolvió")
      ? error.message
      : "La solicitud no se completó. Actualiza los datos antes de reintentar.";
}
