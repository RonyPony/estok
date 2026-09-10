import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AppPageHeader } from '../../shared/ui/page-header';
import { AppTable, TableColumn, TableRow } from '../../shared/ui/data-table';
import { HasPermission } from '../../shared/directives/has-permission';
import { InventoryApiService } from './inventory-api.service';
import { InventoryAdjustmentDialog } from './inventory-adjustment-dialog';
@Component({selector:'app-inventory-page',imports:[RouterLink,MatButtonModule,AppPageHeader,AppTable,HasPermission],template:'<app-page-header [title]="movements ? \'Movimientos de inventario\' : \'Inventario\'" subtitle="Cada entrada y salida, bajo control."><a mat-button [routerLink]="movements ? \'/inventory\' : \'/inventory/movements\'">{{movements?"Ver stock":"Ver movimientos"}}</a><button mat-flat-button *hasPermission="\'inventory.adjust\'" (click)="adjust()">Registrar stock</button><button mat-button *hasPermission="\'inventory.adjust\'" (click)="adjust(true)">Transferir</button></app-page-header><section class="card"><app-table [rows]="rows()" [columns]="columns" [total]="total()" [page]="page()" [loading]="loading()" actionLabel="" (pageChange)="load($event)" /></section>'})
export class InventoryPageComponent {
 private readonly api=inject(InventoryApiService);private readonly dialog=inject(MatDialog);readonly movements=inject(ActivatedRoute).snapshot.data['movements']===true;
 readonly rows=signal<TableRow[]>([]);readonly total=signal(0);readonly page=signal(1);readonly loading=signal(false);
 readonly columns:TableColumn[]=this.movements?[{key:'movementType',label:'Movimiento'},{key:'quantity',label:'Cantidad'},{key:'notes',label:'Motivo'},{key:'createdAt',label:'Fecha UTC'}]:[{key:'sku',label:'SKU'},{key:'name',label:'Producto'},{key:'warehouseName',label:'Almacén'},{key:'quantity',label:'Existencia'},{key:'reservedQuantity',label:'Reservado'},{key:'minimumStock',label:'Mínimo'}];
 constructor(){this.load(1);}
 load(page:number){this.page.set(page);this.loading.set(true);this.api.list(page,this.movements).subscribe({next:r=>{this.rows.set(r.items);this.total.set(r.totalItems);this.loading.set(false);},error:()=>this.loading.set(false)});}
 adjust(transfer=false){this.dialog.open(InventoryAdjustmentDialog,{width:'600px',maxWidth:'95vw',data:{transfer}}).afterClosed().subscribe(saved=>{if(saved)this.load(1);});}
}
