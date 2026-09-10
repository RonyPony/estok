import { Observable } from 'rxjs';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { InventoryApiService, Warehouse } from './inventory-api.service';
import { ProductSelectorComponent } from '../../shared/ui/product-selector';
import { AppConfirmDialog } from '../../shared/ui/confirm-dialog';
@Component({selector:'app-inventory-adjustment',imports:[ReactiveFormsModule,MatDialogModule,MatButtonModule,MatSelectModule,MatInputModule,ProductSelectorComponent],template:'<h2 mat-dialog-title>{{data.transfer?"Transferir inventario":"Registrar ajuste de stock"}}</h2><mat-dialog-content><form [formGroup]="form"><app-product-selector (selected)="form.controls.productId.setValue($event.id)" /><mat-form-field appearance="outline"><mat-label>Almacén {{data.transfer?"de origen":""}}</mat-label><mat-select formControlName="warehouseId">@for(w of warehouses();track w.id){<mat-option [value]="w.id">{{w.name}}</mat-option>}</mat-select></mat-form-field>@if(data.transfer){<mat-form-field appearance="outline"><mat-label>Almacén de destino</mat-label><mat-select formControlName="destinationWarehouseId">@for(w of warehouses();track w.id){<mat-option [value]="w.id">{{w.name}}</mat-option>}</mat-select></mat-form-field>}<mat-form-field appearance="outline"><mat-label>Cantidad {{data.transfer?"":"(negativa para retirar)"}}</mat-label><input matInput type="number" formControlName="quantity" /></mat-form-field><mat-form-field appearance="outline"><mat-label>Motivo</mat-label><input matInput formControlName="notes" /></mat-form-field></form></mat-dialog-content><mat-dialog-actions align="end"><button mat-button mat-dialog-close>Volver</button><button mat-flat-button [disabled]="form.invalid || saving()" (click)="save()">Aplicar</button></mat-dialog-actions>'})
export class InventoryAdjustmentDialog {
 readonly data=inject<{transfer:boolean}>(MAT_DIALOG_DATA);private readonly api=inject(InventoryApiService);private readonly ref=inject(MatDialogRef<InventoryAdjustmentDialog>);private readonly dialog=inject(MatDialog);readonly warehouses=signal<Warehouse[]>([]);readonly saving=signal(false);
 readonly form=inject(FormBuilder).nonNullable.group({productId:['',Validators.required],warehouseId:['',Validators.required],destinationWarehouseId:[''],quantity:[0,Validators.required],notes:['',Validators.required]});
 constructor(){this.api.warehouses().subscribe(w=>{this.warehouses.set(w);this.form.controls.warehouseId.setValue(w[0]?.id??'');});if(this.data.transfer)this.form.controls.destinationWarehouseId.addValidators(Validators.required);}
 save(){if(this.form.invalid)return;this.dialog.open(AppConfirmDialog,{data:{title:'Confirmar movimiento',message:'Este movimiento quedará registrado en el historial de inventario.'}}).afterClosed().subscribe(ok=>{if(!ok)return;this.saving.set(true);const r=this.form.getRawValue();const action:Observable<unknown>=this.data.transfer?this.api.transfer({productId:r.productId,sourceWarehouseId:r.warehouseId,destinationWarehouseId:r.destinationWarehouseId,quantity:r.quantity,notes:r.notes}):this.api.adjust(r);action.subscribe({next:()=>this.ref.close(true),error:()=>this.saving.set(false)});});}
}

