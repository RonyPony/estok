import { inject } from "@angular/core";
import { Router, Routes } from "@angular/router";
import { Auth } from "./core";
const requireSession = () =>
  inject(Auth).isAuthenticated()
    ? true
    : inject(Router).createUrlTree(["/login"]);
export const routes: Routes = [
  {
    path: "login",
    canActivate: [
      () =>
        inject(Auth).isAuthenticated()
          ? inject(Router).createUrlTree(["/dashboard"])
          : true,
    ],
    loadComponent: () => import("./login").then((m) => m.Login),
  },
  {
    path: "",
    loadComponent: () => import("./shell").then((m) => m.Shell),
    canActivate: [requireSession],
    canActivateChild: [requireSession],
    children: [
      {
        path: "dashboard",
        loadComponent: () => import("./dashboard").then((m) => m.Dashboard),
      },
      {
        path: "accounts",
        data: { entity: "ApplicationUser", title: "Cuentas" },
        loadComponent: () => import("./records").then((m) => m.Records),
      },
      {
        path: "businesses",
        data: { entity: "Business", title: "Negocios" },
        loadComponent: () => import("./records").then((m) => m.Records),
      },
      {
        path: "activation",
        data: { entity: "BusinessUser", title: "Activaciones" },
        loadComponent: () => import("./records").then((m) => m.Records),
      },
      {
        path: "trash",
        data: { entity: "Customer", title: "Papelera", trash: true },
        loadComponent: () => import("./records").then((m) => m.Records),
      },
      {
        path: "audit",
        loadComponent: () => import("./audit").then((m) => m.Audit),
      },
      {
        path: "database",
        loadComponent: () => import("./database").then((m) => m.Database),
      },
      { path: "", pathMatch: "full", redirectTo: "dashboard" },
    ],
  },
  { path: "**", redirectTo: "dashboard" },
];
