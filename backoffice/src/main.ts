import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { App } from "./app/app";
import { routes } from "./app/routes";
import { SETTINGS, AppSettings, sessionInterceptor } from "./app/core";

async function start() {
  const response = await fetch("appsettings.json", { cache: "no-store" });
  if (!response.ok) throw new Error("No se pudo cargar appsettings.json.");
  const settings: AppSettings = await response.json();
  if (
    !settings.apiBaseUrl ||
    !settings.applicationName ||
    !Number.isInteger(settings.pageSize) ||
    settings.pageSize < 1 ||
    settings.pageSize > 100 ||
    !Number.isFinite(settings.requestTimeoutMs) ||
    settings.requestTimeoutMs < 1000
  )
    throw new Error("La configuración del backoffice es inválida.");
  settings.apiBaseUrl = settings.apiBaseUrl.replace(/\/$/, "");
  const api = new URL(settings.apiBaseUrl, location.origin);
  if (
    !["http:", "https:"].includes(api.protocol) ||
    api.username ||
    api.password ||
    api.search ||
    api.hash ||
    (location.protocol === "https:" && api.protocol !== "https:")
  )
    throw new Error("La URL de la API es inválida.");
  new Intl.DateTimeFormat(settings.locale, {
    timeZone: settings.timeZone,
  }).format();
  document.title = settings.applicationName;
  await bootstrapApplication(App, {
    providers: [
      { provide: SETTINGS, useValue: settings },
      provideRouter(routes),
      provideHttpClient(withInterceptors([sessionInterceptor])),
    ],
  });
}
start().catch(() => {
  document.body.textContent =
    "No se pudo iniciar el backoffice. Revisa el archivo appsettings.json y vuelve a cargar la página.";
});
