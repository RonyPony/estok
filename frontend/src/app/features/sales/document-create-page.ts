import { PaymentSectionComponent } from './payment-section';
import { HasPermission } from '../../shared/directives/has-permission';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable, finalize } from 'rxjs';
import { AppPageHeader } from '../../shared/ui/page-header';
import { CustomerSelectorComponent } from '../../shared/ui/customer-selector';
import { ProductSelectorComponent } from '../../shared/ui/product-selector';
import { Product } from '../products/products-api.service';
import { InventoryApiService, Warehouse } from '../inventory/inventory-api.service';
import { SalesApiService } from './sales-api.service';
import { QuotesApiService } from '../quotes/quotes-api.service';
import { LineForm, SaleItemsComponent } from './sale-items';
import { SaleTotalsComponent } from './sale-totals';
@Component({selector:'app-document-create',imports:[ReactiveFormsModule,RouterLink,MatButtonModule,MatInputModule,MatSelectModule,AppPageHeader,CustomerSelectorComponent,ProductSelectorComponent,SaleItemsComponent,SaleTotalsComponent,PaymentSectionComponent,HasPermission],template:'<app-page-header [title]="quote?\'Nuevo presupuesto\':\'Nueva venta\'" subtitle="De una buena atención a una nueva oportunidad."><a mat-button [routerLink]="quote?\'/quotes\':\'/sales\'">Volver</a></app-page-header><form class="card" [formGroup]="form" (ngSubmit)="save()"><div class="form-grid"><app-customer-selector (selected)="form.controls.customerId.setValue($event.id)" />@if(!quote){<mat-form-field appearance="outline"><mat-label>Almacén</mat-label><mat-select formControlName="warehouseId">@for(w of warehouses();track w.id){<mat-option [value]="w.id">{{w.name}}</mat-option>}</mat-select></mat-form-field>}</div><h2>Productos</h2><app-product-selector (selected)="add($event)" /><app-sale-items [items]="form.controls.items" (remove)="form.controls.items.removeAt($event)" /><app-sale-totals [subtotal]="subtotal()" [discount]="discount()" [tax]="tax()" />@if(!quote){<app-payment-section [form]="paymentForm" *hasPermission="\'payments.create\'" />}<mat-form-field appearance="outline" style="margin-top:25px"><mat-label>Notas</mat-label><textarea matInput formControlName="notes"></textarea></mat-form-field>@if(error()){<p class="error" role="alert">{{error()}}</p>}<div class="form-actions"><button mat-flat-button [disabled]="saving()">{{saving()?"Guardando…":quote?"Crear presupuesto":"Completar venta"}}</button></div></form>'})
export class DocumentCreatePageComponent {
 readonly quote=inject(ActivatedRoute).snapshot.data['quote']===true;private readonly fb=inject(FormBuilder).nonNullable;private readonly sales=inject(SalesApiService);private readonly quotes=inject(QuotesApiService);private readonly inventory=inject(InventoryApiService);private readonly router=inject(Router);
 readonly warehouses=signal<Warehouse[]>([]);readonly saving=signal(false);readonly error=signal('');readonly form=this.fb.group({customerId:['',Validators.required],warehouseId:[''],notes:[''],items:new FormArray<LineForm>([])});
 readonly paymentForm=this.fb.group({amount:[0,Validators.min(0)],paymentMethodId:['']});
 constructor(){if(!this.quote){this.form.controls.warehouseId.addValidators(Validators.required);this.inventory.warehouses().subscribe(w=>{this.warehouses.set(w);this.form.controls.warehouseId.setValue(w[0]?.id??'');});}}
 add(p:Product){this.form.controls.items.push(this.fb.group({productId:[p.id],description:[p.name],quantity:[1,[Validators.required,Validators.min(.0001)]],discount:[0,Validators.min(0)],price:[p.salePrice],taxRate:[p.taxRate]}));}
 subtotal(){return this.form.controls.items.getRawValue().reduce((s,x)=>s+Math.round(x.quantity*x.price*100)/100,0);}
 discount(){return this.form.controls.items.getRawValue().reduce((s,x)=>s+x.discount,0);}
 tax(){return this.form.controls.items.getRawValue().reduce((s,x)=>s+Math.round((Math.round(x.quantity*x.price*100)/100-x.discount)*x.taxRate)/100,0);}
 save(){this.form.markAllAsTouched();if(this.form.invalid||!this.form.controls.items.length){this.error.set('Selecciona un cliente y agrega al menos un producto.');return;}this.saving.set(true);this.error.set('');const payment=this.paymentForm.getRawValue();const request={...this.form.getRawValue(),payments:payment.amount>0?[payment]:[]};const action:Observable<{id:string}>=this.quote?this.quotes.create(request):this.sales.create(request);action.pipe(finalize(()=>this.saving.set(false))).subscribe({next:r=>void this.router.navigate([this.quote?'/quotes':'/sales',r.id]),error:()=>this.error.set('No se guardó el documento. Revisa los datos y el stock disponible.')});}
}
