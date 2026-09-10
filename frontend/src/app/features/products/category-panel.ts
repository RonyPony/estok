import { Component, inject, signal, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CategoriesApiService, Category } from './categories-api.service';
import { HasPermission } from '../../shared/directives/has-permission';
@Component({selector:'app-category-panel',imports:[ReactiveFormsModule,MatButtonModule,MatInputModule,MatSelectModule,HasPermission],template:'<section class="card" style="margin-top:24px"><h2>Categorías</h2><div class="actions">@for(category of categories();track category.id){<span class="badge">{{category.name}}</span>}@empty{<p>No hay categorías todavía.</p>}</div><form [formGroup]="form" (ngSubmit)="create()" *hasPermission="\'products.create\'" style="margin-top:20px"><div class="form-grid"><mat-form-field appearance="outline"><mat-label>Nueva categoría</mat-label><input matInput formControlName="name" /></mat-form-field><mat-form-field appearance="outline"><mat-label>Categoría superior</mat-label><mat-select formControlName="parentCategoryId"><mat-option [value]="null">Sin categoría superior</mat-option>@for(category of categories();track category.id){<mat-option [value]="category.id">{{category.name}}</mat-option>}</mat-select></mat-form-field></div><button mat-button [disabled]="form.invalid || saving()">Agregar categoría</button></form></section>'})
export class CategoryPanelComponent {
 private readonly api=inject(CategoriesApiService);readonly categories=signal<Category[]>([]);readonly saving=signal(false);readonly changed=output<void>();readonly form=inject(FormBuilder).group({name:['',Validators.required],parentCategoryId:[null as string|null]});
 constructor(){this.load();}load(){this.api.list().subscribe(c=>this.categories.set(c));}
 create(){if(this.form.invalid)return;this.saving.set(true);const r=this.form.getRawValue();this.api.create(r.name!,r.parentCategoryId).subscribe({next:()=>{this.form.reset();this.saving.set(false);this.load();this.changed.emit();},error:()=>this.saving.set(false)});}
}
