import { CategoryPanelComponent } from './category-panel';
import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { AppPageHeader } from '../../shared/ui/page-header';
import { AppTable, TableColumn, TableRow } from '../../shared/ui/data-table';
import { HasPermission } from '../../shared/directives/has-permission';
import { ProductsApiService } from './products-api.service';
@Component({selector:'app-products-list',imports:[ReactiveFormsModule,RouterLink,MatButtonModule,MatInputModule,MatFormFieldModule,MatIconModule,AppPageHeader,AppTable,HasPermission,CategoryPanelComponent],template:`<app-page-header title="Productos" subtitle="Un catálogo organizado para vender mejor."><a mat-flat-button routerLink="new" *hasPermission="'products.create'"><mat-icon>add</mat-icon>Crear producto</a></app-page-header><section class="card"><mat-form-field appearance="outline" style="max-width:360px"><mat-label>Buscar productos</mat-label><mat-icon matPrefix>search</mat-icon><input matInput [formControl]="search" /></mat-form-field><app-table [rows]="rows()" [columns]="columns" [loading]="loading()" [page]="page()" [total]="total()" (pageChange)="load($event)" (selected)="open($event)" emptyText="Aún no tienes productos registrados" /></section><app-category-panel />`})
export class ProductListPageComponent {
 private readonly api=inject(ProductsApiService);private readonly router=inject(Router);
 readonly search=new FormControl('',{nonNullable:true});readonly rows=signal<TableRow[]>([]);readonly loading=signal(false);readonly page=signal(1);readonly total=signal(0);
 readonly columns:TableColumn[]=[{key:'sku',label:'SKU'},{key:'name',label:'Producto'},{key:'salePrice',label:'Precio'},{key:'cost',label:'Costo'},{key:'minimumStock',label:'Stock mínimo'}];
 constructor(){this.search.valueChanges.pipe(debounceTime(300),distinctUntilChanged(),takeUntilDestroyed()).subscribe(()=>this.load(1));this.load(1);}
 load(page:number){this.page.set(page);this.loading.set(true);this.api.list(page,this.search.value).pipe(finalize(()=>this.loading.set(false))).subscribe({next:r=>{this.rows.set(r.items.map(x=>({...x})));this.total.set(r.totalItems);},error:()=>undefined});}
 open(row:TableRow){void this.router.navigate(['/products',row['id']]);}
}

