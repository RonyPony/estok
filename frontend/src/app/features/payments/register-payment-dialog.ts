import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { AppMoney } from '../../shared/ui/money';
import { PaymentMethod, PaymentsApiService } from './payments-api.service';
@Component({selector:'app-register-payment',imports:[ReactiveFormsModule,MatDialogModule,MatInputModule,MatSelectModule,MatButtonModule,AppMoney],template:'<h2 mat-dialog-title>Registrar pago</h2><mat-dialog-content><p>Saldo pendiente: <app-money [amount]="data.balance" /></p><form [formGroup]="form"><mat-form-field appearance="outline"><mat-label>Método de pago</mat-label><mat-select formControlName="paymentMethodId">@for(method of methods();track method.id){<mat-option [value]="method.id">{{method.name}}</mat-option>}</mat-select></mat-form-field><mat-form-field appearance="outline"><mat-label>Monto</mat-label><input matInput type="number" formControlName="amount" /><mat-error>El monto no puede superar el saldo</mat-error></mat-form-field><mat-form-field appearance="outline"><mat-label>Referencia</mat-label><input matInput formControlName="reference" /></mat-form-field></form></mat-dialog-content><mat-dialog-actions align="end"><button mat-button mat-dialog-close>Volver</button><button mat-flat-button [disabled]="form.invalid || saving()" (click)="save()">Registrar pago</button></mat-dialog-actions>'})
export class RegisterPaymentDialog {
 readonly data=inject<{saleId:string;balance:number}>(MAT_DIALOG_DATA);private readonly api=inject(PaymentsApiService);private readonly ref=inject(MatDialogRef<RegisterPaymentDialog>);readonly methods=signal<PaymentMethod[]>([]);readonly saving=signal(false);
 readonly form=inject(FormBuilder).nonNullable.group({paymentMethodId:['',Validators.required],amount:[this.data.balance,[Validators.required,Validators.min(.01),Validators.max(this.data.balance)]],reference:['']});
 constructor(){this.api.methods().subscribe(m=>{this.methods.set(m.filter(x=>x.type!=='Credit'));this.form.controls.paymentMethodId.setValue(this.methods()[0]?.id??'');});}
 save(){if(this.form.invalid||this.saving())return;this.saving.set(true);this.api.create({...this.form.getRawValue(),saleId:this.data.saleId}).subscribe({next:()=>this.ref.close(true),error:()=>this.saving.set(false)});}
}
