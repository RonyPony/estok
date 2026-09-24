import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Product, ProductsApiService } from '../../features/products/products-api.service';
@Component({selector:'app-product-selector',imports:[ReactiveFormsModule,MatAutocompleteModule,MatInputModule,MatFormFieldModule],template:'<mat-form-field appearance="outline"><mat-label>Buscar producto por nombre o SKU</mat-label><input matInput [formControl]="search" [matAutocomplete]="auto" /><mat-autocomplete #auto="matAutocomplete" (optionSelected)="choose($event)">@for(product of products();track product.id){<mat-option [value]="product.id" [disabled]="excludedIds().includes(product.id)">{{product.sku}} · {{product.name}}{{product.categoryName ? " · " + product.categoryName : ""}}{{excludedIds().includes(product.id) ? " · Ya agregado" : ""}}</mat-option>}</mat-autocomplete></mat-form-field>'})
export class ProductSelectorComponent {
 readonly excludedIds=input<string[]>([]);
 private readonly api=inject(ProductsApiService);readonly search=new FormControl('',{nonNullable:true});readonly products=signal<Product[]>([]);readonly selected=output<Product>();
 constructor(){this.search.valueChanges.pipe(debounceTime(300),switchMap(search=>this.api.list(1,search).pipe(catchError(()=>of({items:[]})))),takeUntilDestroyed()).subscribe(r=>this.products.set(r.items));}
 choose(event:MatAutocompleteSelectedEvent){const p=this.products().find(x=>x.id===event.option.value);if(p && !this.excludedIds().includes(p.id)){this.selected.emit(p);this.search.setValue("",{emitEvent:false});}}
}
