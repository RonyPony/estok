import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../core/models/session';
import { TableRow } from '../../shared/ui/data-table';
export interface PaymentMethod {id:string;name:string;type:string;}
@Injectable({providedIn:'root'})
export class PaymentsApiService {
 private readonly http=inject(HttpClient);
 list(pageNumber=1){return this.http.get<PagedResult<TableRow>>(environment.apiBaseUrl+'/payments',{params:{pageNumber,pageSize:20}});}
 methods(){return this.http.get<PaymentMethod[]>(environment.apiBaseUrl+'/payment-methods');}
 create(request:{saleId:string;paymentMethodId:string;amount:number;reference:string}){return this.http.post(environment.apiBaseUrl+'/payments',request);}
}
