import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SessionBusiness } from '../../core/models/session';
export interface SettingsRequest {name:string;currency:string;country:string;timeZone:string;allowNegativeStock:boolean;defaultTaxRate:number;quoteExpirationDays:number;invoicePrefix:string;quotePrefix:string;}
export interface SettingsResponse {logo:string|null;business:SessionBusiness;settings:SettingsRequest;}
@Injectable({providedIn:'root'})
export class SettingsApiService {private readonly http=inject(HttpClient);uploadLogo(file:File){const body=new FormData();body.append("file",file);return this.http.put<{logo:string}>(environment.apiBaseUrl+"/settings/logo",body);}get(){return this.http.get<SettingsResponse>(environment.apiBaseUrl+'/settings');}save(request:SettingsRequest){return this.http.put<SettingsResponse>(environment.apiBaseUrl+'/settings',request);}}
