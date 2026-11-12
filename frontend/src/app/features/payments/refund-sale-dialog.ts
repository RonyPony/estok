import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs';
import { SalesApiService } from '../sales/sales-api.service';
import { AppMoney } from '../../shared/ui/money';

@Component({selector:'app-refund-sale',imports:[ReactiveFormsModule,MatDialogModule,MatInputModule,MatButtonModule,AppMoney],template:`
 <h2 mat-dialog-title>Registrar reembolso</h2><mat-dialog-content>
 <p>Devuelve los pagos al cliente por sus medios originales y registra aquí la salida de dinero.</p>
 <p>Importe a devolver: <app-money [amount]="data.amount" /></p>
 <p>Este registro no ejecuta transferencias bancarias. Después podrás anular la venta y devolver el inventario.</p>
 <form [formGroup]="form">
 <mat-form-field appearance="outline"><mat-label>Referencia del reembolso</mat-label><input matInput formControlName="reference" maxlength="200" /></mat-form-field>
 <mat-form-field appearance="outline"><mat-label>Motivo</mat-label><textarea matInput formControlName="reason" maxlength="500"></textarea></mat-form-field>
 </form>@if(error()){<p class="error" role="alert">{{error()}}</p>}
 </mat-dialog-content><mat-dialog-actions align="end"><button mat-button [disabled]="saving()" mat-dialog-close>Volver</button>
 <button mat-flat-button [disabled]="form.invalid||saving()" (click)="save()">Confirmar dinero devuelto</button></mat-dialog-actions>`})
export class RefundSaleDialog {
 readonly data=inject<{saleId:string;amount:number}>(MAT_DIALOG_DATA);
 private readonly api=inject(SalesApiService); private readonly ref=inject(MatDialogRef<RefundSaleDialog>);
 readonly saving=signal(false);readonly error=signal('');
 readonly form=inject(FormBuilder).nonNullable.group({reference:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(200)]],reason:['',[Validators.required,Validators.pattern(/\S/),Validators.maxLength(500)]]});
 save(){if(this.form.invalid||this.saving())return;this.saving.set(true);this.ref.disableClose=true;this.api.refund(this.data.saleId,this.form.getRawValue()).pipe(finalize(()=>{this.saving.set(false);this.ref.disableClose=false;})).subscribe({next:()=>this.ref.close(true),error:()=>this.error.set('No se pudo registrar el reembolso. Revisa el estado de la venta antes de volver a intentarlo.')});}
}
