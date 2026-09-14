import { Component, input, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { A11yModule } from "@angular/cdk/a11y";
@Component({
  selector: "bo-confirmation",
  imports: [FormsModule, A11yModule],
  template: `
    <div class="modal-shade">
      <section
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        (keydown.escape)="!busy() && cancel.emit()"
      >
        <span class="eyebrow">CONFIRMAR OPERACIÓN</span>
        <h2 id="confirm-title">{{ title() }}</h2>
        <p>{{ description() }}</p>
        <form (ngSubmit)="submit()">
          <label
            >Motivo<textarea
              name="reason"
              [(ngModel)]="reason"
              required
              minlength="5"
              maxlength="500"
              rows="3"
              cdkFocusInitial
            ></textarea>
          </label>
          <label
            >Escribe <strong class="break">{{ confirmation() }}</strong> para
            confirmar<input
              name="confirmation"
              [(ngModel)]="typed"
              autocomplete="off"
              required
          /></label>
          @if (error()) {
            <p class="alert error" role="alert">{{ error() }}</p>
          }
          <div class="modal-actions">
            <button type="button" (click)="cancel.emit()" [disabled]="busy()">
              Cancelar</button
            ><button
              [class.danger]="danger()"
              [class.primary]="!danger()"
              [disabled]="
                busy() ||
                reason.trim().length < 5 ||
                typed.toLowerCase() !== confirmation().toLowerCase()
              "
            >
              {{ busy() ? "Procesando…" : "Confirmar" }}
            </button>
          </div>
        </form>
      </section>
    </div>
  `,
})
export class Confirmation {
  title = input.required<string>();
  description = input.required<string>();
  confirmation = input.required<string>();
  busy = input(false);
  error = input("");
  danger = input(false);
  cancel = output<void>();
  confirm = output<{ reason: string; confirmation: string }>();
  reason = "";
  typed = "";
  submit() {
    if (
      !this.busy() &&
      this.reason.trim().length >= 5 &&
      this.typed.toLowerCase() === this.confirmation().toLowerCase()
    )
      this.confirm.emit({
        reason: this.reason.trim(),
        confirmation: this.typed,
      });
  }
}
