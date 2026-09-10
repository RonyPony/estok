import { Component, inject, input, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { environment } from '../../../environments/environment';
import { HasPermission } from '../../shared/directives/has-permission';
interface CustomerAddress {id:string;addressLine1:string;country:string;}
@Injectable({providedIn:'root'})
export class CustomerAddressesApiService {private readonly http=inject(HttpClient);list(id:string){return this.http.get<CustomerAddress[]>(`${environment.apiBaseUrl}/customers/${id}/addresses`);}add(id:string,request:{addressLine1:string;country:string}){return this.http.post<CustomerAddress>(`${environment.apiBaseUrl}/customers/${id}/addresses`,request);}}
@Component({selector:'app-customer-addresses',imports:[ReactiveFormsModule,MatButtonModule,MatInputModule,HasPermission],template:'<section class="card" style="margin-top:24px"><h2>Direcciones</h2>@for(address of addresses();track address.id){<p>{{address.addressLine1}} · {{address.country}}</p>}@empty{<p>Aún no has agregado direcciones.</p>}<form [formGroup]="form" (ngSubmit)="add()" *hasPermission="\'customers.edit\'"><div class="form-grid"><mat-form-field appearance="outline"><mat-label>Dirección</mat-label><input matInput formControlName="addressLine1" /></mat-form-field><mat-form-field appearance="outline"><mat-label>País</mat-label><input matInput formControlName="country" maxlength="2" /></mat-form-field></div><button mat-button [disabled]="form.invalid || saving()">Agregar dirección</button></form></section>'})
export class CustomerAddressesComponent implements OnInit {
 readonly customerId=input.required<string>();private readonly api=inject(CustomerAddressesApiService);readonly addresses=signal<CustomerAddress[]>([]);readonly saving=signal(false);readonly form=inject(FormBuilder).nonNullable.group({addressLine1:['',Validators.required],country:['DO',[Validators.required,Validators.minLength(2)]]});
 ngOnInit(){this.load();}load(){this.api.list(this.customerId()).subscribe(a=>this.addresses.set(a));}
 add(){if(this.form.invalid)return;this.saving.set(true);this.api.add(this.customerId(),this.form.getRawValue()).subscribe({next:()=>{this.saving.set(false);this.form.controls.addressLine1.reset();this.load();},error:()=>this.saving.set(false)});}
}
