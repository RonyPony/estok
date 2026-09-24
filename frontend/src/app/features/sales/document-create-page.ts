import { PaymentSectionComponent } from './payment-section';
import { HasPermission } from '../../shared/directives/has-permission';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Observable, finalize, map } from 'rxjs';
import { AppPageHeader } from '../../shared/ui/page-header';
import { CustomerSelectorComponent } from '../../shared/ui/customer-selector';
import { ProductSelectorComponent } from '../../shared/ui/product-selector';
import { Product } from '../products/products-api.service';
import { InventoryApiService, Warehouse } from '../inventory/inventory-api.service';
import { SalesApiService } from './sales-api.service';
import { QuotesApiService } from '../quotes/quotes-api.service';
import { SettingsApiService } from '../settings/settings-api.service';
import { LineForm, SaleItemsComponent } from './sale-items';
import { SaleTotalsComponent } from './sale-totals';
@Component({
 selector: 'app-document-create',
 imports: [ReactiveFormsModule,RouterLink,MatButtonModule,MatInputModule,MatSelectModule,MatCheckboxModule,AppPageHeader,CustomerSelectorComponent,ProductSelectorComponent,SaleItemsComponent,SaleTotalsComponent,PaymentSectionComponent,HasPermission],
 template: `
 <app-page-header [title]="quote?'Nuevo presupuesto':'Nueva venta'" subtitle="Selecciona los productos, revisa los importes y completa la operación.">
   <a mat-button [routerLink]="quote?'/quotes':'/sales'">Volver</a>
 </app-page-header>
 <form class="card document-editor" [formGroup]="form" (ngSubmit)="save()">
   <span class="eyebrow">01 · DATOS DE LA OPERACIÓN</span>
   <div class="form-grid">
     @if(!quote){
       <mat-form-field appearance="outline"><mat-label>Tipo de venta</mat-label>
         <mat-select [value]="cashOnly()" (selectionChange)="setCashOnly($event.value)">
           <mat-option [value]="true">Al contado · Sin registrar cliente</mat-option>
           <mat-option [value]="false">Cliente registrado</mat-option>
       </mat-select>
     </mat-form-field>
       <mat-form-field appearance="outline"><mat-label>Almacén</mat-label><mat-select formControlName="warehouseId">@for(w of warehouses();track w.id){<mat-option [value]="w.id">{{w.name}}</mat-option>}</mat-select></mat-form-field>
       <mat-form-field appearance="outline"><mat-label>Impuesto</mat-label><mat-select formControlName="sellerAssumesTax">
         <mat-option [value]="false">Cliente paga impuesto</mat-option>
         <mat-option [value]="true">Yo asumiré el impuesto</mat-option>
       </mat-select></mat-form-field>
     }
     @if(quote || !cashOnly()){<app-customer-selector (selected)="form.controls.customerId.setValue($event.id)" />}
   </div>
   @if(!quote && cashOnly()){<p class="info-panel">La factura se emitirá a nombre de Consumidor final. Se requiere el pago completo.</p>}
   <div class="section-divider"></div>
   <span class="eyebrow">02 · PRODUCTOS</span>
   <h2>Agrega un producto y su cantidad</h2>
   <mat-form-field appearance="outline"><mat-label>Impuestos</mat-label>
     <mat-select formControlName="pricesIncludeTax">
       <mat-option [value]="false">Sumar el impuesto al precio</mat-option>
       <mat-option [value]="true">Asumir el impuesto · incluido en el precio</mat-option>
     </mat-select>
   </mat-form-field>
   @if(pricesIncludeTax()){<p class="field-help">El cliente paga el precio indicado menos el descuento. El impuesto se desglosa dentro de ese importe.</p>}
   <app-product-selector [excludedIds]="productIds()" (selected)="selectProduct($event)" />
   @if(pendingProduct();as product){
     <div class="product-entry">
       <div><strong>{{product.name}}</strong><p>Indica la cantidad antes de agregarlo.</p></div>
       <mat-form-field appearance="outline"><mat-label>Cantidad</mat-label><input matInput type="number" [formControl]="quantity" min="0.0001" max="1000000" step="0.0001" /></mat-form-field>
       <button mat-flat-button type="button" (click)="addPending()" [disabled]="quantity.invalid">Agregar producto</button>
     </div>
   }
   @if(!quote){<mat-checkbox formControlName="includeCategoriesInReceipt">Mostrar categorías en el recibo</mat-checkbox>}
   @if(lines().length){<app-sale-items [items]="lineControls()" (remove)="removeLine($event)" />}
   @else{<div class="empty">Busca tu primer producto para comenzar.</div>}
   <p class="field-help">Cada producto ocupa una sola línea. Puedes modificar su cantidad en la tabla.</p>
   <app-sale-totals [subtotal]="subtotal()" [discount]="discount()" [tax]="tax()" [total]="total()" [sellerAssumesTax]="sellerAssumesTax()" [pricesIncludeTax]="pricesIncludeTax()" />
   @if(!quote){
     <div class="section-divider"></div><span class="eyebrow">03 · PAGO</span>
     <app-payment-section [form]="paymentForm" [cashOnly]="cashOnly()" *hasPermission="'payments.create'" />
     @if(cashOnly()){<button mat-stroked-button type="button" (click)="payTotal()" *hasPermission="'payments.create'">Usar el total de la venta</button>}
   }
   <mat-form-field appearance="outline" style="margin-top:25px"><mat-label>Notas</mat-label><textarea matInput formControlName="notes" maxlength="500"></textarea></mat-form-field>
   @if(error()){<p class="error" role="alert">{{error()}}</p>}
   <div class="form-actions"><button mat-flat-button [disabled]="saving()">{{saving()?"Guardando…":quote?"Crear presupuesto":"Completar venta"}}</button></div>
 </form>`
})
export class DocumentCreatePageComponent {
 readonly quote=inject(ActivatedRoute).snapshot.data['quote']===true;
 private readonly fb=inject(FormBuilder).nonNullable;
 private readonly sales=inject(SalesApiService);
 private readonly quotes=inject(QuotesApiService);
 private readonly settings=inject(SettingsApiService);
 private readonly inventory=inject(InventoryApiService);
 private readonly router=inject(Router);
 readonly cashOnly=signal(!this.quote);
 readonly warehouses=signal<Warehouse[]>([]);
 readonly saving=signal(false);
 readonly error=signal('');
 readonly pendingProduct=signal<Product|null>(null);
 readonly allowDuplicateSaleItems=signal(false);
 readonly sellerAssumesTax=signal(false);
 readonly quantity=this.fb.control(1,[Validators.required,Validators.min(.0001),Validators.max(1000000)]);
 readonly form=this.fb.group({customerId:[''],warehouseId:[''],notes:['',Validators.maxLength(500)],sellerAssumesTax:[false],includeCategoriesInReceipt:[false],pricesIncludeTax:[false],items:new FormArray<LineForm>([])});
 readonly lines=toSignal(this.form.controls.items.valueChanges.pipe(map(()=>this.form.controls.items.getRawValue())),{initialValue:this.form.controls.items.getRawValue()});
 readonly lineControls=computed(()=>{this.lines();return [...this.form.controls.items.controls];});
 readonly pricesIncludeTax=toSignal(this.form.controls.pricesIncludeTax.valueChanges,{initialValue:false});
 readonly productIds=computed(()=>this.allowDuplicateSaleItems()&&!this.quote?[]:this.lines().map(x=>x.productId));
 readonly paymentForm=this.fb.group({amount:[0,Validators.min(0)],paymentMethodId:['']});
 constructor(){
   if(this.quote)this.form.controls.customerId.addValidators(Validators.required);
   else {this.form.controls.warehouseId.addValidators(Validators.required);this.inventory.warehouses().subscribe(w=>{this.warehouses.set(w);this.form.controls.warehouseId.setValue(w[0]?.id??'');});}
   if(!this.quote)this.settings.get().subscribe(r=>this.allowDuplicateSaleItems.set(r.settings.allowDuplicateSaleItems??false));
   this.form.controls.items.valueChanges.pipe(takeUntilDestroyed()).subscribe(()=>this.form.controls.items.updateValueAndValidity({emitEvent:false}));
   this.form.controls.sellerAssumesTax.valueChanges.pipe(takeUntilDestroyed()).subscribe(value=>this.sellerAssumesTax.set(this.boolValue(value)));
 }
 setCashOnly(value:boolean){this.cashOnly.set(value);const customer=this.form.controls.customerId;customer.setValue('');customer.setValidators(value?[]:[Validators.required]);customer.updateValueAndValidity();}
 selectProduct(product:Product){if(this.productIds().includes(product.id))return;this.pendingProduct.set(product);this.quantity.setValue(1);}
 addPending(){
   const p=this.pendingProduct();if(!p||this.quantity.invalid)return;
   if(!this.allowDuplicateSaleItems()&&this.lines().some(x=>x.productId===p.id)){this.error.set('Este producto ya está agregado. Modifica su cantidad en la tabla.');return;}
   this.form.controls.items.push(this.fb.group({productId:[p.id],description:[p.name],categoryName:[p.categoryName??''],comment:['',Validators.maxLength(300)],quantity:[this.quantity.value,[Validators.required,Validators.min(.0001),Validators.max(1000000)]],discount:[0,Validators.min(0)],price:[p.salePrice],taxRate:[p.taxRate]}));
   this.pendingProduct.set(null);this.error.set('');
 }
 removeLine(index:number){this.form.controls.items.removeAt(index);}
 subtotal(){return money(this.lines().reduce((s,x)=>s+money(x.quantity*x.price),0));}
 discount(){return money(this.lines().reduce((s,x)=>s+x.discount,0));}
 tax(){return money(this.lines().reduce((s,x)=>s+money((money(x.quantity*x.price)-x.discount)*x.taxRate/(this.pricesIncludeTax()?100+x.taxRate:100)),0));}
 total(){return money(this.subtotal()-this.discount()+(this.pricesIncludeTax()?0:this.tax())-(this.sellerAssumesTax()?(this.pricesIncludeTax()?this.tax():this.tax()*2):0));}
 payTotal(){this.paymentForm.controls.amount.setValue(this.total());}
 save(){
   if(this.saving())return;
   this.form.markAllAsTouched();this.paymentForm.markAllAsTouched();
   if(this.form.invalid||!this.form.controls.items.length){this.error.set('Revisa los datos requeridos y agrega al menos un producto.');return;}
   if(this.pendingProduct()){this.error.set('Agrega el producto seleccionado antes de continuar.');return;}
   const payment=this.paymentForm.getRawValue();
   if(!this.quote&&(this.paymentForm.invalid||(payment.amount>0&&!payment.paymentMethodId))){this.error.set('Revisa el monto y el método de pago.');return;}
   if(!this.quote&&this.cashOnly()&&payment.amount!==this.total()){this.error.set('La venta sin cliente requiere el pago completo. Usa el total de la venta.');return;}
   this.saving.set(true);this.error.set('');
   const values=this.form.getRawValue();
   const request={...values,sellerAssumesTax:this.boolValue(values.sellerAssumesTax),includeCategoriesInReceipt:this.boolValue(values.includeCategoriesInReceipt),pricesIncludeTax:this.boolValue(values.pricesIncludeTax),customerId:!this.quote&&this.cashOnly()?null:values.customerId,payments:payment.amount>0?[payment]:[]};
   const action:Observable<{id:string}>=this.quote?this.quotes.create(request):this.sales.create(request);
   action.pipe(finalize(()=>this.saving.set(false))).subscribe({next:r=>void this.router.navigate([this.quote?'/quotes':'/sales',r.id]),error:e=>this.error.set(e.error?.message??'No se guardó el documento. Revisa los datos y el stock disponible.')});
 }
 private boolValue(value:unknown){return value===true||value==='true';}
}

function money(value:number){return Math.round((value+Number.EPSILON*Math.max(1,Math.abs(value)))*100)/100;}
