import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../core/models/session';
export interface CustomerRequest { code: string; firstName: string; lastName: string; email: string; phone: string; documentNumber: string; notes: string; }
export interface Customer extends CustomerRequest { id: string; }
@Injectable({providedIn:'root'})
export class CustomersApiService {
 private readonly http=inject(HttpClient); private readonly url=environment.apiBaseUrl+'/customers';
 list(pageNumber=1,search=''){return this.http.get<PagedResult<Customer>>(this.url,{params:{pageNumber,pageSize:20,search,sortBy:'name',sortDirection:'asc'}});}
 get(id:string){return this.http.get<Customer>(this.url+'/'+id);}
 save(id:string|null,request:CustomerRequest){return id?this.http.put<Customer>(this.url+'/'+id,request):this.http.post<Customer>(this.url,request);}
 delete(id:string){return this.http.delete<void>(this.url+'/'+id);}
}
