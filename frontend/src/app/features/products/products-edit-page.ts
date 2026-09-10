import { CategoriesApiService, Category } from './categories-api.service';
import { MatSelectModule } from '@angular/material/select';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { AppPageHeader } from '../../shared/ui/page-header';
import { RecordFormComponent, FormField } from '../../shared/ui/record-form';
import { AppConfirmDialog } from '../../shared/ui/confirm-dialog';
import { HasPermission } from '../../shared/directives/has-permission';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProductsApiService } from './products-api.service';
@Component({selector:'app-products-edit',imports:[ReactiveFormsModule,RouterLink,MatButtonModule,AppPageHeader,RecordFormComponent,HasPermission,MatSelectModule],template:`<app-page-header [title]="id ? 'Detalle de product' : 'Crear producto'" subtitle="La información correcta hace la diferencia."><a mat-button routerLink="/products">Volver a productos</a></app-page-header><form class="card" [formGroup]="form" (ngSubmit)="save()"><app-record-form [form]="form" [fields]="fields" /><mat-form-field appearance="outline"><mat-label>Categoría</mat-label><mat-select formControlName="categoryId"><mat-option value="">Sin categoría</mat-option>@for(category of categories();track category.id){<mat-option [value]="category.id">{{category.name}}</mat-option>}</mat-select></mat-form-field><div class="form-actions">@if(id){<button type="button" mat-button *hasPermission="'products.delete'" (click)="remove()">Eliminar</button>}<button mat-flat-button [disabled]="loading() || !canSave()">{{loading()?'Guardando…':'Guardar cambios'}}</button></div></form>`})
export class ProductEditPageComponent {
 private readonly api=inject(ProductsApiService);private readonly router=inject(Router);private readonly dialog=inject(MatDialog);private readonly notifications=inject(NotificationService);private readonly state=inject(AuthStateService);
 readonly id=inject(ActivatedRoute).snapshot.paramMap.get('id');readonly loading=signal(false);
 readonly fields:FormField[]=[{ key: 'sku', label: 'SKU' }, { key: 'name', label: 'Nombre' }, { key: 'cost', label: 'Costo', type: 'number' }, { key: 'salePrice', label: 'Precio de venta', type: 'number' }, { key: 'taxRate', label: 'Impuesto (%)', type: 'number' }, { key: 'minimumStock', label: 'Stock mínimo', type: 'number' }, { key: 'barcode', label: 'Código de barras' }, { key: 'description', label: 'Descripción' }, { key: 'trackInventory', label: 'Controlar inventario', type: 'checkbox' }];
 readonly form=inject(FormBuilder).nonNullable.group({categoryId: [''], sku: ['', Validators.required], name: ['', Validators.required], cost: [0, [Validators.required, Validators.min(0)]], salePrice: [0, [Validators.required, Validators.min(0)]], taxRate: [0, [Validators.min(0), Validators.max(100)]], minimumStock: [0, Validators.min(0)], barcode: [''], description: [''], trackInventory: [true]});
 canSave(){return this.state.has(this.id?'products.edit':'products.create');}
 readonly categories=signal<Category[]>([]); private readonly categoriesApi=inject(CategoriesApiService); constructor(){this.categoriesApi.list().subscribe(c=>this.categories.set(c));if(this.id)this.api.get(this.id).subscribe({next:r=>{this.form.patchValue({...r,categoryId:r.categoryId??""});if(!this.canSave())this.form.disable();},error:()=>void this.router.navigateByUrl('/products')});}
 save(){this.form.markAllAsTouched();if(this.form.invalid||!this.canSave()||this.loading())return;this.loading.set(true);this.api.save(this.id,{...this.form.getRawValue(),categoryId:this.form.controls.categoryId.value||null}).pipe(finalize(()=>this.loading.set(false))).subscribe({next:()=>{this.notifications.success('Cambios guardados');void this.router.navigateByUrl('/products');},error:()=>undefined});}
 remove(){this.dialog.open(AppConfirmDialog,{data:{title:'Eliminar registro',message:'El registro se ocultará del catálogo. El historial se conservará.'}}).afterClosed().subscribe((confirmed:boolean)=>{if(confirmed&&this.id)this.api.delete(this.id).subscribe({next:()=>void this.router.navigateByUrl('/products'),error:()=>undefined});});}
}

