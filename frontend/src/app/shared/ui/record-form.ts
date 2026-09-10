import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
export interface FormField { key: string; label: string; type?: 'text' | 'number' | 'email' | 'password' | 'checkbox'; }
@Component({selector:'app-record-form',imports:[ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatCheckboxModule],template:'<div class="form-grid" [formGroup]="form()">@for(field of fields();track field.key){@if(field.type === "checkbox"){<mat-checkbox [formControlName]="field.key">{{field.label}}</mat-checkbox>}@else{<mat-form-field appearance="outline"><mat-label>{{field.label}}</mat-label><input matInput [type]="field.type ?? \'text\'" [formControlName]="field.key" /><mat-error>Revisa este campo</mat-error></mat-form-field>}}</div>'})
export class RecordFormComponent { readonly form=input.required<FormGroup>();readonly fields=input.required<FormField[]>(); }
