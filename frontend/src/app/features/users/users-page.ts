import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { AppPageHeader } from '../../shared/ui/page-header';
import { RecordFormComponent, FormField } from '../../shared/ui/record-form';
import { AppConfirmDialog } from '../../shared/ui/confirm-dialog';
import { HasPermission } from '../../shared/directives/has-permission';
import { BusinessUser, Role, UsersApiService } from './users-api.service';
@Component({selector:'app-users-page',imports:[ReactiveFormsModule,MatButtonModule,MatSelectModule,AppPageHeader,RecordFormComponent,HasPermission],template:'<app-page-header title="Equipo y accesos" subtitle="Las personas correctas, con los permisos correctos." /><section class="card"><div class="table-scroll"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acceso</th><th></th></tr></thead><tbody>@for(user of users();track user.id){<tr><td>{{user.firstName}} {{user.lastName}}</td><td>{{user.email}}</td><td>@if(user.isOwner){Propietario}@else{<mat-select [value]="user.roleId" (selectionChange)="update(user,$event.value,user.isActive)" aria-label="Rol del usuario">@for(role of roles();track role.id){<mat-option [value]="role.id">{{role.name}}</mat-option>}</mat-select>}</td><td>{{user.isActive?"Activo":"Inactivo"}}</td><td>@if(!user.isOwner){<button mat-button *hasPermission="\'users.manage\'" (click)="update(user,user.roleId,!user.isActive)">{{user.isActive?"Desactivar":"Activar"}}</button>}</td></tr>}</tbody></table></div></section><form class="card" style="margin-top:24px" [formGroup]="form" (ngSubmit)="create()" *hasPermission="\'users.manage\'"><h2>Agregar integrante</h2><app-record-form [form]="form" [fields]="fields" /><mat-form-field appearance="outline"><mat-label>Rol</mat-label><mat-select formControlName="roleId">@for(role of roles();track role.id){<mat-option [value]="role.id">{{role.name}}</mat-option>}</mat-select></mat-form-field><div class="form-actions"><button mat-flat-button [disabled]="form.invalid||saving()">Crear usuario</button></div></form>'})
export class UsersPageComponent {
 private readonly api=inject(UsersApiService);private readonly dialog=inject(MatDialog);readonly users=signal<BusinessUser[]>([]);readonly roles=signal<Role[]>([]);readonly saving=signal(false);
 readonly fields:FormField[]=[{key:'firstName',label:'Nombre'},{key:'lastName',label:'Apellido'},{key:'email',label:'Correo',type:'email'},{key:'password',label:'Contraseña inicial',type:'password'}];
 readonly form=inject(FormBuilder).nonNullable.group({firstName:['',Validators.required],lastName:['',Validators.required],email:['',[Validators.required,Validators.email]],password:['',[Validators.required,Validators.minLength(10)]],roleId:['',Validators.required]});
 constructor(){this.load();this.api.roles().subscribe(r=>this.roles.set(r.filter(x=>x.name!=='Owner')));}
 load(){this.api.list().subscribe(u=>this.users.set(u));}
 create(){if(this.form.invalid)return;this.saving.set(true);this.api.create(this.form.getRawValue()).subscribe({next:()=>{this.saving.set(false);this.form.reset();this.load();},error:()=>this.saving.set(false)});}
 update(user:BusinessUser,roleId:string,isActive:boolean){this.dialog.open(AppConfirmDialog,{data:{title:'Cambiar acceso',message:'Los permisos del integrante se actualizarán inmediatamente.'}}).afterClosed().subscribe(ok=>{if(ok)this.api.update(user.id,{roleId,isActive}).subscribe({next:()=>this.load(),error:()=>this.load()});else this.load();});}
}
