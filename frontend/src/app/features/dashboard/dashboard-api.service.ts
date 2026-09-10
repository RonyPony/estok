import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
export interface Dashboard { salesToday: number; salesThisMonth: number; estimatedProfit: number; accountsReceivable: number; customers: number; products: number; quotesPending: number; lowStock: number; recentSales: {id:string;saleNumber:string;total:number;paymentStatus:string}[]; lowStockProducts: {id:string;name:string;sku:string;quantity:number}[]; outstandingReceivables: {id:string;balance:number}[]; salesChart: {date:string;total:number}[]; }
@Injectable({providedIn:'root'})
export class DashboardApiService { private readonly http = inject(HttpClient); get() { return this.http.get<Dashboard>(`${environment.apiBaseUrl}/dashboard`); } }
