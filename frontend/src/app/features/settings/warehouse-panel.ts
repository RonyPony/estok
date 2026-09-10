import { Component, Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { environment } from '../../../environments/environment';
import { InventoryApiService, Warehouse } from '../inventory/inventory-api.service';
import { HasPermission } from '../../shared/directives/has-permission';
@Injectable({providedIn:'root'})
export class WarehousesApiService {private readonly http=inject(HttpClient);create(name:string){return this.http.post<Warehouse>(environment.apiBaseUrl+'/warehouses',{name});}}
@Component({selector:'app-warehouse-panel',imports:[ReactiveFormsModule,MatButtonModule,MatInputModule,HasPermission],template:'<section class="card" style="margin-top:24px"><h2>Almacenes</h2><div class="actions">@for(warehouse of warehouses();track warehouse.id){<span class="badge">{{warehouse.name}}</span>}</div><div *hasPermission="\'settings.manage\'" style="margin-top:20px"><mat-form-field appearance="outline"><mat-label>Nombre del nuevo almacén</mat-label><input matInput [formControl]="name" /></mat-form-field><button mat-button [disabled]="name.invalid || saving()" (click)="create()">Agregar almacén</button></div></section>'})
export class WarehousePanelComponent {
 private readonly inventory=inject(InventoryApiService);private readonly api=inject(WarehousesApiService);readonly warehouses=signal<Warehouse[]>([]);readonly saving=signal(false);readonly name=new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.maxLength(200)]});
 constructor(){this.load();}load(){this.inventory.warehouses().subscribe(w=>this.warehouses.set(w));}
 create(){if(this.name.invalid)return;this.saving.set(true);this.api.create(this.name.value).subscribe({next:()=>{this.name.reset();this.saving.set(false);this.load();},error:()=>this.saving.set(false)});}
}
