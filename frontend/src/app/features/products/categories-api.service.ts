import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
export interface Category {id:string;name:string;parentCategoryId:string|null;}
@Injectable({providedIn:'root'})
export class CategoriesApiService {
 private readonly http=inject(HttpClient);
 list(){return this.http.get<Category[]>(environment.apiBaseUrl+'/categories');}
 create(name:string,parentCategoryId:string|null){return this.http.post<Category>(environment.apiBaseUrl+'/categories',{name,parentCategoryId});}
 update(id:string,name:string,parentCategoryId:string|null){return this.http.put<Category>(environment.apiBaseUrl+'/categories/'+id,{name,parentCategoryId});}
 delete(id:string){return this.http.delete<void>(environment.apiBaseUrl+'/categories/'+id);}
}
