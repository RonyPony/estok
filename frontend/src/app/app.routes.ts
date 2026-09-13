import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from './core/guards/auth.guard';
export const routes: Routes = [
 {path:'',pathMatch:'full',loadComponent:()=>import('./features/landing/landing-page').then(m=>m.LandingPageComponent)},
 {path:'',loadComponent:()=>import('./layout/auth-layout').then(m=>m.AuthLayoutComponent),children:[
  {path:'login',loadComponent:()=>import('./features/auth/auth-page').then(m=>m.AuthPageComponent)},
  {path:'register',data:{register:true},loadComponent:()=>import('./features/auth/auth-page').then(m=>m.AuthPageComponent)},
 ]},
 {path:'',canActivate:[authGuard],loadComponent:()=>import('./layout/app-layout').then(m=>m.AppLayoutComponent),children:[
  {path:'dashboard',canActivate:[permissionGuard],data:{permission:'reports.view'},loadComponent:()=>import('./features/dashboard/dashboard-page').then(m=>m.DashboardPageComponent)},
  {path:'customers',canActivate:[permissionGuard],data:{permission:'customers.view'},loadComponent:()=>import('./features/customers/customers-list-page').then(m=>m.CustomerListPageComponent)},
  {path:'customers/new',canActivate:[permissionGuard],data:{permission:'customers.create'},loadComponent:()=>import('./features/customers/customers-edit-page').then(m=>m.CustomerEditPageComponent)},
  {path:'customers/:id',canActivate:[permissionGuard],data:{permission:'customers.view'},loadComponent:()=>import('./features/customers/customers-edit-page').then(m=>m.CustomerEditPageComponent)},
  {path:'products',canActivate:[permissionGuard],data:{permission:'products.view'},loadComponent:()=>import('./features/products/products-list-page').then(m=>m.ProductListPageComponent)},
  {path:'products/new',canActivate:[permissionGuard],data:{permission:'products.create'},loadComponent:()=>import('./features/products/products-edit-page').then(m=>m.ProductEditPageComponent)},
  {path:'products/:id',canActivate:[permissionGuard],data:{permission:'products.view'},loadComponent:()=>import('./features/products/products-edit-page').then(m=>m.ProductEditPageComponent)},
  {path:'inventory',canActivate:[permissionGuard],data:{permission:'inventory.view'},loadComponent:()=>import('./features/inventory/inventory-page').then(m=>m.InventoryPageComponent)},
  {path:'inventory/movements',canActivate:[permissionGuard],data:{permission:'inventory.view',movements:true},loadComponent:()=>import('./features/inventory/inventory-page').then(m=>m.InventoryPageComponent)},
  {path:'sales',canActivate:[permissionGuard],data:{permission:'sales.view'},loadComponent:()=>import('./features/sales/document-list-page').then(m=>m.DocumentListPageComponent)},
  {path:'sales/new',canActivate:[permissionGuard],data:{permission:'sales.create'},loadComponent:()=>import('./features/sales/document-create-page').then(m=>m.DocumentCreatePageComponent)},
  {path:'sales/:id',canActivate:[permissionGuard],data:{permission:'sales.view'},loadComponent:()=>import('./features/sales/document-detail-page').then(m=>m.DocumentDetailPageComponent)},
  {path:'quotes',canActivate:[permissionGuard],data:{permission:'quotes.view',quote:true},loadComponent:()=>import('./features/sales/document-list-page').then(m=>m.DocumentListPageComponent)},
  {path:'quotes/new',canActivate:[permissionGuard],data:{permission:'quotes.create',quote:true},loadComponent:()=>import('./features/sales/document-create-page').then(m=>m.DocumentCreatePageComponent)},
  {path:'quotes/:id',canActivate:[permissionGuard],data:{permission:'quotes.view',quote:true},loadComponent:()=>import('./features/sales/document-detail-page').then(m=>m.DocumentDetailPageComponent)},
  {path:'accounts-receivable',canActivate:[permissionGuard],data:{permission:'payments.view'},loadComponent:()=>import('./features/accounts-receivable/receivables-page').then(m=>m.ReceivablesPageComponent)},
  {path:'payments',canActivate:[permissionGuard],data:{permission:'payments.view',payments:true},loadComponent:()=>import('./features/accounts-receivable/receivables-page').then(m=>m.ReceivablesPageComponent)},
  {path:'users',canActivate:[permissionGuard],data:{permission:'users.view'},loadComponent:()=>import('./features/users/users-page').then(m=>m.UsersPageComponent)},
  {path:'settings',canActivate:[permissionGuard],data:{permission:'settings.view'},loadComponent:()=>import('./features/settings/settings-page').then(m=>m.SettingsPageComponent)},
  {path:'forbidden',loadComponent:()=>import('./shared/ui/forbidden-page').then(m=>m.ForbiddenPage)},
  {path:'',pathMatch:'full',redirectTo:'dashboard'},
 ]},
 {path:'**',redirectTo:'dashboard'},
];
