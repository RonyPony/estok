import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppPageHeader } from '../../shared/ui/page-header';
import { AppTable, TableColumn, TableRow } from '../../shared/ui/data-table';
import { AccountsReceivableApiService } from './accounts-receivable-api.service';
import { PaymentsApiService } from '../payments/payments-api.service';
@Component({selector:'app-receivables-page',imports:[RouterLink,AppPageHeader,AppTable],template:'<app-page-header [title]="payments?\'Pagos recibidos\':\'Cuentas por cobrar\'" subtitle="Una visión clara de tus ingresos y saldos."><a mat-button [routerLink]="payments ? \'/accounts-receivable\' : \'/payments\'">{{payments ? \'Ver cuentas por cobrar\' : \'Ver pagos recibidos\'}}</a></app-page-header><section class="card"><app-table [rows]="rows()" [columns]="columns" [total]="total()" [page]="page()" [loading]="loading()" (pageChange)="load($event)" actionLabel="Ver venta" (selected)="open($event)" /></section>'})
export class ReceivablesPageComponent {
 readonly payments=inject(ActivatedRoute).snapshot.data['payments']===true;private readonly debts=inject(AccountsReceivableApiService);private readonly api=inject(PaymentsApiService);private readonly router=inject(Router);readonly rows=signal<TableRow[]>([]);readonly total=signal(0);readonly page=signal(1);readonly loading=signal(false);
 readonly columns:TableColumn[]=this.payments?[{key:'amount',label:'Monto'},{key:'reference',label:'Referencia'},{key:'paymentDate',label:'Fecha UTC'}]:[{key:'originalAmount',label:'Monto original'},{key:'balance',label:'Saldo'},{key:'status',label:'Estado'},{key:'dueDate',label:'Vencimiento'}];
 constructor(){this.load(1);}
 load(page:number){this.page.set(page);this.loading.set(true);(this.payments?this.api.list(page):this.debts.list(page)).subscribe({next:r=>{this.rows.set(r.items);this.total.set(r.totalItems);this.loading.set(false);},error:()=>this.loading.set(false)});}
 open(row:TableRow){void this.router.navigate(['/sales',row['saleId']]);}
}
