import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../core/models/session';
export interface ProductRequest { categoryId?: string | null; sku: string; name: string; cost: number; salePrice: number; taxRate: number; minimumStock: number; barcode: string; description: string; trackInventory: boolean; }
export interface Product extends ProductRequest { id: string; categoryName?: string | null; }
@Injectable({providedIn:'root'})
export class ProductsApiService {
 private readonly http=inject(HttpClient); private readonly url=environment.apiBaseUrl+'/products';
 list(pageNumber=1,search=''){return this.http.get<PagedResult<Product>>(this.url,{params:{pageNumber,pageSize:20,search,sortBy:'name',sortDirection:'asc'}});}
 get(id:string){return this.http.get<Product>(this.url+'/'+id);}
 save(id:string|null,request:ProductRequest){return id?this.http.put<Product>(this.url+'/'+id,request):this.http.post<Product>(this.url,request);}
 delete(id:string){return this.http.delete<void>(this.url+'/'+id);}
}

