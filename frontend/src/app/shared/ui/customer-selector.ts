import { Component, inject, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Customer, CustomersApiService } from '../../features/customers/customers-api.service';
@Component({selector:'app-customer-selector',imports:[ReactiveFormsModule,MatAutocompleteModule,MatInputModule,MatFormFieldModule],template:'<mat-form-field appearance="outline"><mat-label>Buscar cliente</mat-label><input matInput [formControl]="search" [matAutocomplete]="auto" /><mat-autocomplete #auto="matAutocomplete" (optionSelected)="choose($event)">@for(customer of customers();track customer.id){<mat-option [value]="customer.id">{{customer.code}} · {{customer.firstName}} {{customer.lastName}}</mat-option>}</mat-autocomplete></mat-form-field>'})
export class CustomerSelectorComponent {
 private readonly api=inject(CustomersApiService);readonly search=new FormControl('',{nonNullable:true});readonly customers=signal<Customer[]>([]);readonly selected=output<Customer>();
 constructor(){this.search.valueChanges.pipe(debounceTime(300),switchMap(search=>this.api.list(1,search).pipe(catchError(()=>of({items:[]})))),takeUntilDestroyed()).subscribe(r=>this.customers.set(r.items));}
 choose(event:MatAutocompleteSelectedEvent){const c=this.customers().find(x=>x.id===event.option.value);if(c){this.selected.emit(c);this.search.setValue(c.firstName,{emitEvent:false});}}
}
