import { QuoteEditDialog } from '../quotes/quote-edit-dialog';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import { AppPageHeader } from '../../shared/ui/page-header';
import { AppMoney } from '../../shared/ui/money';
import { AppStatusBadge } from '../../shared/ui/status-badge';
import { AppConfirmDialog } from '../../shared/ui/confirm-dialog';
import { HasPermission } from '../../shared/directives/has-permission';
import { Sale, SalesApiService } from './sales-api.service';
import { Quote, QuotesApiService } from '../quotes/quotes-api.service';
import { InventoryApiService, Warehouse } from '../inventory/inventory-api.service';
import { SaleTotalsComponent } from './sale-totals';
import { RegisterPaymentDialog } from '../payments/register-payment-dialog';
@Component({selector:'app-document-detail',imports:[RouterLink,MatButtonModule,MatSelectModule,AppPageHeader,AppMoney,AppStatusBadge,HasPermission,SaleTotalsComponent],template:'<app-page-header [title]="title()" subtitle="El detalle de tu operación."><a mat-button [routerLink]="quote?\'/quotes\':\'/sales\'">Volver</a></app-page-header>@if(document();as d){<section class="card"><app-status-badge [label]="d.status" tone="info" /><div class="table-scroll" style="margin-top:20px"><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Total</th></tr></thead><tbody>@for(line of d.items;track line.id){<tr><td>{{line.description}}</td><td>{{line.quantity}}</td><td><app-money [amount]="line.unitPrice" /></td><td><app-money [amount]="line.total" /></td></tr>}</tbody></table></div><app-sale-totals [subtotal]="d.subtotal" [discount]="d.discount" [tax]="d.tax" />@if(!quote){<p style="text-align:right;margin-top:20px">Saldo: <app-money [amount]="balance()" /></p>}<div class="form-actions">@if(quote && d.status!=="Converted"){<button mat-button *hasPermission="\'quotes.edit\'" (click)="edit()">Actualizar presupuesto</button><mat-form-field appearance="outline" style="max-width:250px"><mat-label>Almacén para la venta</mat-label><mat-select [value]="warehouseId()" (selectionChange)="warehouseId.set($event.value)">@for(w of warehouses();track w.id){<mat-option [value]="w.id">{{w.name}}</mat-option>}</mat-select></mat-form-field><button mat-flat-button *hasPermission="\'quotes.convert\'" [disabled]="!warehouseId() || busy()" (click)="convert()">Convertir a venta</button>}@if(!quote && d.status==="Completed"){<button mat-button *hasPermission="\'sales.cancel\'" [disabled]="busy()" (click)="cancel()">Cancelar venta</button>@if(balance()>0){<button mat-flat-button *hasPermission="\'payments.create\'" (click)="pay()">Registrar pago</button>}}</div></section>}'} )
export class DocumentDetailPageComponent {
 private readonly route=inject(ActivatedRoute);readonly quote=this.route.snapshot.data['quote']===true;private readonly id=this.route.snapshot.paramMap.get('id')!;private readonly sales=inject(SalesApiService);private readonly quotes=inject(QuotesApiService);private readonly inventory=inject(InventoryApiService);private readonly router=inject(Router);private readonly dialog=inject(MatDialog);
 readonly document=signal<Sale|Quote|null>(null);readonly warehouses=signal<Warehouse[]>([]);readonly warehouseId=signal('');readonly busy=signal(false);
 constructor(){this.load();if(this.quote)this.inventory.warehouses().subscribe(w=>{this.warehouses.set(w);this.warehouseId.set(w[0]?.id??'');});}
 load(){const action:Observable<Sale|Quote>=this.quote?this.quotes.get(this.id):this.sales.get(this.id);action.subscribe({next:d=>this.document.set(d),error:()=>void this.router.navigateByUrl(this.quote?'/quotes':'/sales')});}
 title(){const d=this.document();return d?('saleNumber' in d?d.saleNumber:d.quoteNumber):'Detalle';}
 balance(){const d=this.document();return d&&'balance' in d?d.balance:0;}
 pay(){this.dialog.open(RegisterPaymentDialog,{width:'440px',data:{saleId:this.id,balance:this.balance()}}).afterClosed().subscribe(ok=>{if(ok)this.load();});}
 cancel(){this.dialog.open(AppConfirmDialog,{data:{title:'Cancelar venta',message:'Se devolverá el inventario y se cancelará el saldo pendiente. Las ventas con pagos requieren reembolso previo.'}}).afterClosed().subscribe(ok=>{if(ok){this.busy.set(true);this.sales.cancel(this.id).subscribe({next:()=>{this.busy.set(false);this.load();},error:()=>this.busy.set(false)});}});}
 edit(){const d=this.document();if(d)this.dialog.open(QuoteEditDialog,{width:'480px',data:d}).afterClosed().subscribe(ok=>{if(ok)this.load();});}
 convert(){this.busy.set(true);this.quotes.convert(this.id,this.warehouseId()).subscribe({next:s=>void this.router.navigate(['/sales',s.id]),error:()=>this.busy.set(false)});}
}
