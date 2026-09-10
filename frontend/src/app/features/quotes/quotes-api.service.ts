import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../core/models/session';
import { DocumentLine, DocumentRequest, Sale } from '../sales/sales-api.service';
export interface Quote {notes:string|null;expirationDate:string;id:string;customerId:string;quoteNumber:string;status:string;total:number;subtotal:number;discount:number;tax:number;items:DocumentLine[];}
@Injectable({providedIn:'root'})
export class QuotesApiService {
 private readonly http=inject(HttpClient);private readonly url=environment.apiBaseUrl+'/quotes';
 list(pageNumber=1){return this.http.get<PagedResult<Quote>>(this.url,{params:{pageNumber,pageSize:20}});}
 get(id:string){return this.http.get<Quote>(this.url+'/'+id);}
 create(request:DocumentRequest){return this.http.post<Quote>(this.url,request);}
 update(id:string,request:{status:string;notes:string;expirationDate:string}){return this.http.put<Quote>(this.url+'/'+id,request);}
 convert(id:string,warehouseId:string){return this.http.post<Sale>(this.url+'/'+id+'/convert-to-sale',{warehouseId});}
}
