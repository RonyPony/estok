import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../core/models/session';
export interface DocumentLine { id:string;productId:string;description:string;quantity:number;unitPrice:number;discount:number;tax:number;total:number; }
export interface Sale {id:string;customerId:string|null;warehouseId:string;saleNumber:string;status:string;total:number;subtotal:number;discount:number;tax:number;balance:number;paidAmount:number;paymentStatus:string;items:DocumentLine[];}
export interface DocumentRequest {customerId:string|null;warehouseId:string;notes:string;items:{productId:string;quantity:number;discount:number}[];}
@Injectable({providedIn:'root'})
export class SalesApiService {
 private readonly http=inject(HttpClient);private readonly url=environment.apiBaseUrl+'/sales';
 list(pageNumber=1){return this.http.get<PagedResult<Sale>>(this.url,{params:{pageNumber,pageSize:20}});}
 pdf(id:string){return this.http.get(this.url+"/"+id+"/pdf",{responseType:"blob"});}
 get(id:string){return this.http.get<Sale>(this.url+'/'+id);}
 create(request:DocumentRequest){return this.http.post<Sale>(this.url,request);}
 cancel(id:string){return this.http.post<Sale>(this.url+'/'+id+'/cancel',{});}
}
