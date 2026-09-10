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
import { CustomersApiService } from './customers-api.service';
@Component({selector:'app-customers-list',imports:[ReactiveFormsModule,RouterLink,MatButtonModule,MatInputModule,MatFormFieldModule,MatIconModule,AppPageHeader,AppTable,HasPermission],template:`<app-page-header title="Clientes" subtitle="Cada cliente, una relación que crece."><a mat-flat-button routerLink="new" *hasPermission="'customers.create'"><mat-icon>add</mat-icon>Agregar cliente</a></app-page-header><section class="card"><mat-form-field appearance="outline" style="max-width:360px"><mat-label>Buscar clientes</mat-label><mat-icon matPrefix>search</mat-icon><input matInput [formControl]="search" /></mat-form-field><app-table [rows]="rows()" [columns]="columns" [loading]="loading()" [page]="page()" [total]="total()" (pageChange)="load($event)" (selected)="open($event)" emptyText="Aún no tienes clientes registrados" /></section>`})
export class CustomerListPageComponent {
 private readonly api=inject(CustomersApiService);private readonly router=inject(Router);
 readonly search=new FormControl('',{nonNullable:true});readonly rows=signal<TableRow[]>([]);readonly loading=signal(false);readonly page=signal(1);readonly total=signal(0);
 readonly columns:TableColumn[]=[{key:'code',label:'Código'},{key:'firstName',label:'Nombre'},{key:'lastName',label:'Apellido'},{key:'email',label:'Correo'},{key:'phone',label:'Teléfono'}];
 constructor(){this.search.valueChanges.pipe(debounceTime(300),distinctUntilChanged(),takeUntilDestroyed()).subscribe(()=>this.load(1));this.load(1);}
 load(page:number){this.page.set(page);this.loading.set(true);this.api.list(page,this.search.value).pipe(finalize(()=>this.loading.set(false))).subscribe({next:r=>{this.rows.set(r.items.map(x=>({...x})));this.total.set(r.totalItems);},error:()=>undefined});}
 open(row:TableRow){void this.router.navigate(['/customers',row['id']]);}
}
