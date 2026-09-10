import { CustomerAddressesComponent } from './customer-addresses';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { AppPageHeader } from '../../shared/ui/page-header';
import { RecordFormComponent, FormField } from '../../shared/ui/record-form';
import { AppConfirmDialog } from '../../shared/ui/confirm-dialog';
import { HasPermission } from '../../shared/directives/has-permission';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { NotificationService } from '../../core/services/notification.service';
import { CustomersApiService } from './customers-api.service';
@Component({selector:'app-customers-edit',imports:[ReactiveFormsModule,RouterLink,MatButtonModule,AppPageHeader,RecordFormComponent,HasPermission,CustomerAddressesComponent],template:`<app-page-header [title]="id ? 'Detalle de customer' : 'Agregar cliente'" subtitle="La información correcta hace la diferencia."><a mat-button routerLink="/customers">Volver a clientes</a></app-page-header><form class="card" [formGroup]="form" (ngSubmit)="save()"><app-record-form [form]="form" [fields]="fields" /><div class="form-actions">@if(id){<button type="button" mat-button *hasPermission="'customers.delete'" (click)="remove()">Eliminar</button>}<button mat-flat-button [disabled]="loading() || !canSave()">{{loading()?'Guardando…':'Guardar cambios'}}</button></div></form>@if(id){<app-customer-addresses [customerId]="id" />}`})
export class CustomerEditPageComponent {
 private readonly api=inject(CustomersApiService);private readonly router=inject(Router);private readonly dialog=inject(MatDialog);private readonly notifications=inject(NotificationService);private readonly state=inject(AuthStateService);
 readonly id=inject(ActivatedRoute).snapshot.paramMap.get('id');readonly loading=signal(false);
 readonly fields:FormField[]=[{ key: 'code', label: 'Código' }, { key: 'firstName', label: 'Nombre' }, { key: 'lastName', label: 'Apellido' }, { key: 'email', label: 'Correo', type: 'email' }, { key: 'phone', label: 'Teléfono' }, { key: 'documentNumber', label: 'Documento' }, { key: 'notes', label: 'Notas' }];
 readonly form=inject(FormBuilder).nonNullable.group({code: ['', Validators.required], firstName: ['', Validators.required], lastName: [''], email: ['', Validators.email], phone: [''], documentNumber: [''], notes: ['']});
 canSave(){return this.state.has(this.id?'customers.edit':'customers.create');}
 constructor(){if(this.id)this.api.get(this.id).subscribe({next:r=>{this.form.patchValue(r);if(!this.canSave())this.form.disable();},error:()=>void this.router.navigateByUrl('/customers')});}
 save(){this.form.markAllAsTouched();if(this.form.invalid||!this.canSave()||this.loading())return;this.loading.set(true);this.api.save(this.id,this.form.getRawValue()).pipe(finalize(()=>this.loading.set(false))).subscribe({next:()=>{this.notifications.success('Cambios guardados');void this.router.navigateByUrl('/customers');},error:()=>undefined});}
 remove(){this.dialog.open(AppConfirmDialog,{data:{title:'Eliminar registro',message:'El registro se ocultará del catálogo. El historial se conservará.'}}).afterClosed().subscribe((confirmed:boolean)=>{if(confirmed&&this.id)this.api.delete(this.id).subscribe({next:()=>void this.router.navigateByUrl('/customers'),error:()=>undefined});});}
}

