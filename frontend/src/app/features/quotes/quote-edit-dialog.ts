import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Quote, QuotesApiService } from './quotes-api.service';
@Component({selector:'app-quote-edit',imports:[ReactiveFormsModule,MatDialogModule,MatInputModule,MatSelectModule,MatButtonModule],template:'<h2 mat-dialog-title>Actualizar presupuesto</h2><mat-dialog-content><form [formGroup]="form"><mat-form-field appearance="outline"><mat-label>Estado</mat-label><mat-select formControlName="status"><mat-option value="Draft">Borrador</mat-option><mat-option value="Sent">Enviado</mat-option><mat-option value="Accepted">Aceptado</mat-option><mat-option value="Rejected">Rechazado</mat-option></mat-select></mat-form-field><mat-form-field appearance="outline"><mat-label>Vigencia hasta</mat-label><input matInput type="date" formControlName="expirationDate" /></mat-form-field><mat-form-field appearance="outline"><mat-label>Notas</mat-label><textarea matInput formControlName="notes"></textarea></mat-form-field></form></mat-dialog-content><mat-dialog-actions align="end"><button mat-button mat-dialog-close>Volver</button><button mat-flat-button [disabled]="form.invalid||saving()" (click)="save()">Guardar</button></mat-dialog-actions>'})
export class QuoteEditDialog {
 readonly data=inject<Quote>(MAT_DIALOG_DATA);private readonly api=inject(QuotesApiService);private readonly ref=inject(MatDialogRef<QuoteEditDialog>);readonly saving=signal(false);
 readonly form=inject(FormBuilder).nonNullable.group({status:[this.data.status,Validators.required],notes:[this.data.notes??''],expirationDate:[this.data.expirationDate.slice(0,10),Validators.required]});
 save(){if(this.form.invalid)return;this.saving.set(true);const r=this.form.getRawValue();this.api.update(this.data.id,{...r,expirationDate:r.expirationDate+'T23:59:59Z'}).subscribe({next:()=>this.ref.close(true),error:()=>this.saving.set(false)});}
}
