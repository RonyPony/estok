import { Component, inject, input, signal, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PaymentMethod, PaymentsApiService } from '../payments/payments-api.service';
export type InitialPaymentForm=FormGroup<{amount:FormControl<number>;paymentMethodId:FormControl<string>}>;
@Component({selector:'app-payment-section',imports:[ReactiveFormsModule,MatInputModule,MatSelectModule],template:'<section [formGroup]="form()" style="margin-top:24px"><h2>Pago inicial</h2><p>Deja el monto en cero para registrar la venta a crédito.</p><div class="form-grid"><mat-form-field appearance="outline"><mat-label>Monto recibido</mat-label><input matInput type="number" formControlName="amount" min="0" /></mat-form-field><mat-form-field appearance="outline"><mat-label>Método de pago</mat-label><mat-select formControlName="paymentMethodId">@for(method of methods();track method.id){<mat-option [value]="method.id">{{method.name}}</mat-option>}</mat-select></mat-form-field></div></section>'})
export class PaymentSectionComponent implements OnInit {
 readonly form=input.required<InitialPaymentForm>();private readonly api=inject(PaymentsApiService);readonly methods=signal<PaymentMethod[]>([]);
 ngOnInit(){this.api.methods().subscribe(m=>{this.methods.set(m.filter(x=>x.type!=='Credit'));this.form().controls.paymentMethodId.setValue(this.methods()[0]?.id??'');});}
}
