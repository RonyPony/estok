import { Component, inject, signal, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CategoriesApiService, Category } from './categories-api.service';
import { HasPermission } from '../../shared/directives/has-permission';
import { AppConfirmDialog } from '../../shared/ui/confirm-dialog';
@Component({selector:'app-category-panel',imports:[ReactiveFormsModule,MatButtonModule,MatInputModule,MatSelectModule,MatDialogModule,MatIconModule,HasPermission],template:'<section class="card" style="margin-top:24px"><h2>Categorías</h2><div class="actions">@for(category of categories();track category.id){<span class="badge">{{category.name}}<button mat-icon-button type="button" (click)="edit(category)" *hasPermission="\'products.edit\'" aria-label="Editar categoría"><mat-icon>edit</mat-icon></button><button mat-icon-button type="button" (click)="remove(category)" *hasPermission="\'products.delete\'" aria-label="Eliminar categoría"><mat-icon>delete</mat-icon></button></span>}@empty{<p>No hay categorías todavía.</p>}</div><form [formGroup]="form" (ngSubmit)="save()" *hasPermission="\'products.create\'" style="margin-top:20px"><div class="form-grid"><mat-form-field appearance="outline"><mat-label>{{editingId()?"Editar categoría":"Nueva categoría"}}</mat-label><input matInput formControlName="name" maxlength="200" /></mat-form-field><mat-form-field appearance="outline"><mat-label>Categoría superior</mat-label><mat-select formControlName="parentCategoryId"><mat-option [value]="null">Sin categoría superior</mat-option>@for(category of categories();track category.id){@if(category.id!==editingId()){<mat-option [value]="category.id">{{category.name}}</mat-option>}}</mat-select></mat-form-field></div><button mat-button [disabled]="form.invalid || saving()">{{editingId()?"Guardar categoría":"Agregar categoría"}}</button>@if(editingId()){<button mat-button type="button" (click)="cancelEdit()">Cancelar</button>}</form></section>'})
export class CategoryPanelComponent {
 private readonly api=inject(CategoriesApiService);private readonly dialog=inject(MatDialog);readonly categories=signal<Category[]>([]);readonly saving=signal(false);readonly editingId=signal<string|null>(null);readonly changed=output<void>();readonly form=inject(FormBuilder).group({name:['',[Validators.required,Validators.maxLength(200)]],parentCategoryId:[null as string|null]});
 constructor(){this.load();}load(){this.api.list().subscribe(c=>this.categories.set(c));}
 edit(category:Category){this.editingId.set(category.id);this.form.setValue({name:category.name,parentCategoryId:category.parentCategoryId});}
 cancelEdit(){this.editingId.set(null);this.form.reset({name:'',parentCategoryId:null});}
 save(){if(this.form.invalid)return;this.saving.set(true);const r=this.form.getRawValue();const id=this.editingId();const action=id?this.api.update(id,r.name!,r.parentCategoryId):this.api.create(r.name!,r.parentCategoryId);action.subscribe({next:()=>{this.cancelEdit();this.saving.set(false);this.load();this.changed.emit();},error:()=>this.saving.set(false)});}
 remove(category:Category){this.dialog.open(AppConfirmDialog,{data:{title:'Eliminar categoría',message:'Los productos actuales quedarán sin categoría. Las ventas históricas conservarán su información.'}}).afterClosed().subscribe(ok=>{if(!ok)return;this.api.delete(category.id).subscribe(()=>{this.load();this.changed.emit();});});}
}
