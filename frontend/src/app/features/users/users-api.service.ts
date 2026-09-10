import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
export interface BusinessUser {id:string;firstName:string;lastName:string;email:string;roleId:string;roleName:string;isActive:boolean;isOwner:boolean;}
export interface Role {id:string;name:string;}
@Injectable({providedIn:'root'})
export class UsersApiService {
 private readonly http=inject(HttpClient);private readonly url=environment.apiBaseUrl;
 list(){return this.http.get<BusinessUser[]>(this.url+'/users');} roles(){return this.http.get<Role[]>(this.url+'/roles');}
 create(request:{firstName:string;lastName:string;email:string;password:string;roleId:string}){return this.http.post(this.url+'/users',request);}
 update(id:string,request:{roleId:string;isActive:boolean}){return this.http.put<void>(this.url+'/users/'+id,request);}
}
