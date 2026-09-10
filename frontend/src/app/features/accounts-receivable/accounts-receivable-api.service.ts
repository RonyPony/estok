import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../core/models/session';
import { TableRow } from '../../shared/ui/data-table';
@Injectable({providedIn:'root'})
export class AccountsReceivableApiService {private readonly http=inject(HttpClient);list(pageNumber=1){return this.http.get<PagedResult<TableRow>>(environment.apiBaseUrl+'/accounts-receivable',{params:{pageNumber,pageSize:20}});}}
