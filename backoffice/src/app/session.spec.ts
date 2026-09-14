import { TestBed } from "@angular/core/testing";
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { Router, provideRouter } from "@angular/router";
import { App } from "./app";
import { routes } from "./routes";
import { Auth, SETTINGS, sessionInterceptor } from "./core";

function authenticate() {
  TestBed.inject(Auth).set({
    accessToken: "admin-token",
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    user: {
      id: "id",
      firstName: "Ana",
      lastName: "Pérez",
      email: "admin@example.com",
    },
  });
}

function flushReads() {
  for (const request of TestBed.inject(HttpTestingController).match(
    (r) => r.method === "GET",
  )) {
    if (request.request.url.endsWith("/catalog"))
      request.flush({
        entities: [],
        allowPermanentDeletion: false,
        allowSessionCleanup: false,
      });
    else if (request.request.url.endsWith("/database"))
      request.flush({
        tables: [],
        pendingMigrations: [],
        retentionDays: 30,
        cleanupCandidates: 0,
      });
    else if (request.request.url.endsWith("/dashboard"))
      request.flush({
        users: 1,
        activeUsers: 1,
        recentlyActiveUsers: 1,
        activityMinutes: 15,
        pendingUsers: 0,
        businesses: 0,
        activeBusinesses: 0,
        pendingMemberships: 0,
        deletedRecords: 0,
        auditActions: 1,
      });
    else
      request.flush({ items: [], pageNumber: 1, totalItems: 0, totalPages: 0 });
  }
}

describe("Sesión administrativa", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([sessionInterceptor])),
        provideHttpClientTesting(),
        {
          provide: SETTINGS,
          useValue: {
            applicationName: "eStok Backoffice",
            apiBaseUrl: "/api/backoffice",
            pageSize: 20,
            requestTimeoutMs: 30000,
            locale: "es-DO",
            timeZone: "America/Caracas",
          },
        },
      ],
    }),
  );
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    TestBed.inject(Auth).logout();
  });

  it("dirige al acceso cuando no existe sesión", async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl("/database");
    fixture.detectChanges();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe("/login");
    expect(fixture.nativeElement.textContent).toContain(
      "Acceso administrativo",
    );
  });

  it("abre el resumen después del login sin perder el outlet al mostrar la navegación", async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const http = TestBed.inject(HttpTestingController);
    await router.navigateByUrl("/login");
    fixture.detectChanges();
    const email: HTMLInputElement =
      fixture.nativeElement.querySelector("input[name=email]");
    const password: HTMLInputElement = fixture.nativeElement.querySelector(
      "input[name=password]",
    );
    email.value = "admin@example.com";
    email.dispatchEvent(new Event("input"));
    password.value = "ExamplePassword123!";
    password.dispatchEvent(new Event("input"));
    fixture.nativeElement
      .querySelector("form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    http.expectOne("/api/backoffice/login").flush({
      accessToken: "admin-token",
      expiresAt: new Date(Date.now() + 60000).toISOString(),
      user: {
        id: "id",
        firstName: "Ana",
        lastName: "Pérez",
        email: "admin@example.com",
      },
    });
    await vi.waitFor(() => expect(router.url).toBe("/dashboard"));
    fixture.detectChanges();
    const request = http.expectOne("/api/backoffice/dashboard");
    expect(request.request.headers.get("Authorization")).toBe(
      "Bearer admin-token",
    );
    request.flush({
      users: 1,
      activeUsers: 1,
      recentlyActiveUsers: 1,
      activityMinutes: 15,
      pendingUsers: 0,
      businesses: 0,
      activeBusinesses: 0,
      pendingMemberships: 0,
      deletedRecords: 0,
      auditActions: 1,
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Resumen operativo");
    expect(fixture.nativeElement.textContent).toContain("Ana");
  });

  it("no envía el token administrativo a otras rutas o servicios", () => {
    TestBed.inject(Auth).set({
      accessToken: "admin-token",
      expiresAt: new Date(Date.now() + 60000).toISOString(),
      user: {
        id: "id",
        firstName: "Ana",
        lastName: "Pérez",
        email: "admin@example.com",
      },
    });
    TestBed.inject(HttpClient).get("https://other.example/api").subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne(
      "https://other.example/api",
    );
    expect(req.request.headers.has("Authorization")).toBe(false);
    req.flush({});
  });

  it("rechaza respuestas sin vencimiento en vez de iniciar y cerrar la sesión inmediatamente", () => {
    const auth = TestBed.inject(Auth);
    expect(() =>
      auth.set({ accessToken: "business-token", user: { id: "id" } } as any),
    ).toThrow("sesión administrativa válida");
    expect(auth.session()).toBeNull();
    expect(() =>
      auth.set({
        accessToken: "expired",
        expiresAt: new Date(0).toISOString(),
        user: { id: "id" },
      } as any),
    ).toThrow();
  });

  it("permite navegar por todas las secciones y evita volver al login con sesión válida", async () => {
    authenticate();
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    for (const [path, title] of [
      ["/dashboard", "Resumen operativo"],
      ["/accounts", "Cuentas"],
      ["/businesses", "Negocios"],
      ["/activation", "Activaciones"],
      ["/trash", "Papelera"],
      ["/audit", "Auditoría"],
      ["/database", "Base de datos"],
      ["/login", "Resumen operativo"],
      ["/ruta-inexistente", "Resumen operativo"],
    ]) {
      await router.navigateByUrl(path);
      fixture.detectChanges();
      flushReads();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector("h1")?.textContent).toContain(
        title,
      );
      expect(fixture.nativeElement.querySelectorAll("nav").length).toBe(1);
    }
    TestBed.inject(Auth).logout();
    await vi.waitFor(() => expect(router.url).toBe("/login"));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("nav")).toBeNull();
    await router.navigateByUrl("/accounts");
    expect(router.url).toBe("/login");
  });

  it("vuelve a comprobar el vencimiento al cambiar de sección", async () => {
    authenticate();
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl("/accounts");
    fixture.detectChanges();
    flushReads();
    await fixture.whenStable();
    const auth = TestBed.inject(Auth);
    auth.session.update((s) => ({
      ...s!,
      expiresAt: new Date(0).toISOString(),
    }));
    await router.navigateByUrl("/database");
    expect(router.url).toBe("/login");
  });

  it("restablece membresías después de revisar roles y actualiza filtros de auditoría", async () => {
    authenticate();
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const http = TestBed.inject(HttpTestingController);
    await router.navigateByUrl("/activation?entity=Role");
    fixture.detectChanges();
    flushReads();
    await fixture.whenStable();
    await router.navigateByUrl("/activation?businessId=negocio");
    fixture.detectChanges();
    const members = http.expectOne((r) =>
      r.url.endsWith("/records/BusinessUser"),
    );
    expect(members.request.params.get("businessId")).toBe("negocio");
    members.flush({ items: [], totalItems: 0, totalPages: 0 });
    await fixture.whenStable();
    await router.navigateByUrl("/audit?userId=uno");
    fixture.detectChanges();
    flushReads();
    await fixture.whenStable();
    await router.navigateByUrl("/audit?userId=dos&businessId=negocio");
    fixture.detectChanges();
    const audit = http.expectOne((r) => r.url.endsWith("/audit"));
    expect(audit.request.params.get("userId")).toBe("dos");
    expect(audit.request.params.get("businessId")).toBe("negocio");
    audit.flush({ items: [], totalItems: 0, totalPages: 0 });
    await fixture.whenStable();
  });
});
