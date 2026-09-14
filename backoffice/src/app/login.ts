import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Api, Auth, Session, message } from "./core";
@Component({
  imports: [FormsModule],
  template: `
    <div class="login">
      <section class="login-intro">
        <div class="brand"><span class="brand-mark">e</span>eStok</div>
        <span class="eyebrow">CENTRO DE ADMINISTRACIÓN</span>
        <h1>Todo eStok.<br />Una sola vista.</h1>
        <p>
          Revisa cuentas y negocios, supervisa la actividad y gestiona la
          recuperación de registros.
        </p>
      </section>
      <section class="login-panel">
        <form (ngSubmit)="login()">
          <span class="eyebrow">BACKOFFICE</span>
          <h2>Acceso administrativo</h2>
          <p class="muted">
            Ingresa con una cuenta autorizada para administrar la plataforma.
          </p>
          <label
            >Correo electrónico<input
              name="email"
              type="email"
              autocomplete="username"
              required
              maxlength="256"
              [(ngModel)]="email"
          /></label>
          <label
            >Contraseña<input
              name="password"
              type="password"
              autocomplete="current-password"
              required
              [(ngModel)]="password"
          /></label>
          @if (error()) {
            <p class="alert error" role="alert">{{ error() }}</p>
          }
          <button class="primary" [disabled]="busy() || !email || !password">
            {{ busy() ? "Verificando acceso…" : "Iniciar sesión" }}
          </button>
          <p class="muted small">
            La sesión vence automáticamente. Los cambios administrativos quedan
            registrados.
          </p>
        </form>
      </section>
    </div>
  `,
})
export class Login {
  email = "";
  password = "";
  error = signal("");
  busy = signal(false);
  private api = inject(Api);
  private auth = inject(Auth);
  private router = inject(Router);
  async login() {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set("");
    try {
      const session = await this.api.post<Session>("/login", {
        email: this.email,
        password: this.password,
      });
      this.password = "";
      this.auth.set(session);
      await this.router.navigateByUrl("/dashboard");
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
}
