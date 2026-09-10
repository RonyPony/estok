import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../core/models/session';
import { TableRow } from '../../shared/ui/data-table';
export interface Warehouse {id:string;name:string;}
@Injectable({providedIn:'root'})
export class InventoryApiService {
 private readonly http=inject(HttpClient);private readonly url=environment.apiBaseUrl;
 list(pageNumber=1,movements=false){return this.http.get<PagedResult<TableRow>>(this.url+'/inventory'+(movements?'/movements':''),{params:{pageNumber,pageSize:20}});}
 warehouses(){return this.http.get<Warehouse[]>(this.url+'/warehouses');}
 adjust(request:{productId:string;warehouseId:string;quantity:number;notes:string}){return this.http.post(this.url+'/inventory/adjust',request);}
 transfer(request:{productId:string;sourceWarehouseId:string;destinationWarehouseId:string;quantity:number;notes:string}){return this.http.post<void>(this.url+'/inventory/transfer',request);}
}
