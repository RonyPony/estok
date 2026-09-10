import { WarehousePanelComponent } from './warehouse-panel';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AppPageHeader } from '../../shared/ui/page-header';
import { RecordFormComponent, FormField } from '../../shared/ui/record-form';
import { HasPermission } from '../../shared/directives/has-permission';
import { NotificationService } from '../../core/services/notification.service';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { SettingsApiService } from './settings-api.service';
@Component({selector:'app-settings-page',imports:[ReactiveFormsModule,MatButtonModule,AppPageHeader,RecordFormComponent,HasPermission,WarehousePanelComponent],template:'<app-page-header title="Configuración" subtitle="Tu negocio, a tu manera." /><form class="card" [formGroup]="form" (ngSubmit)="save()"><h2>Empresa y preferencias</h2><app-record-form [form]="form" [fields]="fields" /><div class="form-actions"><button mat-flat-button *hasPermission="\'settings.manage\'" [disabled]="form.invalid||saving()">Guardar configuración</button></div></form><app-warehouse-panel *hasPermission="\'inventory.view\'" />'})
export class SettingsPageComponent {
 private readonly api=inject(SettingsApiService);private readonly state=inject(AuthStateService);private readonly notifications=inject(NotificationService);readonly saving=signal(false);
 readonly form=inject(FormBuilder).nonNullable.group({name:['',Validators.required],currency:['DOP',Validators.required],country:['DO',Validators.required],timeZone:['America/Santo_Domingo',Validators.required],allowNegativeStock:[false],defaultTaxRate:[0,[Validators.min(0),Validators.max(100)]],quoteExpirationDays:[30,[Validators.min(1),Validators.max(365)]],invoicePrefix:['FAC',Validators.required],quotePrefix:['COT',Validators.required]});
 readonly fields:FormField[]=[{key:'name',label:'Nombre del negocio'},{key:'currency',label:'Moneda (ISO)'},{key:'country',label:'País (ISO)'},{key:'timeZone',label:'Zona horaria'},{key:'defaultTaxRate',label:'Impuesto predeterminado (%)',type:'number'},{key:'quoteExpirationDays',label:'Vigencia del presupuesto (días)',type:'number'},{key:'invoicePrefix',label:'Prefijo de ventas'},{key:'quotePrefix',label:'Prefijo de presupuestos'},{key:'allowNegativeStock',label:'Permitir stock negativo',type:'checkbox'}];
 constructor(){this.api.get().subscribe(r=>{this.form.patchValue({...r.settings,...r.business});if(!this.state.has('settings.manage'))this.form.disable();});}
 save(){if(this.form.invalid)return;this.saving.set(true);this.api.save(this.form.getRawValue()).subscribe({next:r=>{this.saving.set(false);this.state.session.update(s=>s?{...s,business:r.business}:null);this.notifications.success('Configuración guardada');},error:()=>this.saving.set(false)});}
}
