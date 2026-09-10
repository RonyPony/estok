import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Observable, map } from 'rxjs';
import { AppPageHeader } from '../../shared/ui/page-header';
import { AppTable, TableColumn, TableRow } from '../../shared/ui/data-table';
import { HasPermission } from '../../shared/directives/has-permission';
import { SalesApiService } from './sales-api.service';
import { QuotesApiService } from '../quotes/quotes-api.service';
import { PagedResult } from '../../core/models/session';
@Component({selector:'app-document-list',imports:[RouterLink,MatButtonModule,AppPageHeader,AppTable,HasPermission],template:'<app-page-header [title]="quote?\'Presupuestos\':\'Ventas\'" subtitle="Tu actividad comercial, siempre a mano."><a mat-flat-button routerLink="new" *hasPermission="quote?\'quotes.create\':\'sales.create\'">{{quote?"Nuevo presupuesto":"Nueva venta"}}</a></app-page-header><section class="card"><app-table [rows]="rows()" [columns]="columns" [loading]="loading()" [total]="total()" [page]="page()" (pageChange)="load($event)" (selected)="open($event)" /></section>'})
export class DocumentListPageComponent {
 readonly quote=inject(ActivatedRoute).snapshot.data['quote']===true;private readonly sales=inject(SalesApiService);private readonly quotes=inject(QuotesApiService);private readonly router=inject(Router);
 readonly rows=signal<TableRow[]>([]);readonly total=signal(0);readonly page=signal(1);readonly loading=signal(false);readonly columns:TableColumn[]=[{key:this.quote?'quoteNumber':'saleNumber',label:'Número'},{key:'status',label:'Estado'},{key:'total',label:'Total'},...(!this.quote?[{key:'balance',label:'Saldo'}]:[])];
 constructor(){this.load(1);}
 load(page:number){this.page.set(page);this.loading.set(true);const action:Observable<PagedResult<TableRow>>=this.quote?this.quotes.list(page).pipe(map(r=>({...r,items:r.items.map(x=>({id:x.id,quoteNumber:x.quoteNumber,status:x.status,total:x.total}))}))):this.sales.list(page).pipe(map(r=>({...r,items:r.items.map(x=>({id:x.id,saleNumber:x.saleNumber,status:x.status,total:x.total,balance:x.balance}))})));action.subscribe({next:r=>{this.rows.set(r.items);this.total.set(r.totalItems);this.loading.set(false);},error:()=>this.loading.set(false)});}
 open(row:TableRow){void this.router.navigate([this.quote?'/quotes':'/sales',row['id']]);}
}
