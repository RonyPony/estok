import { Component, input, output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
export type LineForm=FormGroup<{productId:FormControl<string>;description:FormControl<string>;quantity:FormControl<number>;discount:FormControl<number>;price:FormControl<number>;taxRate:FormControl<number>}>;
@Component({selector:'app-sale-items',imports:[ReactiveFormsModule,MatInputModule,MatButtonModule,MatIconModule],template:'<div class="table-scroll"><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Descuento</th><th></th></tr></thead><tbody>@for(line of items().controls;track line){<tr [formGroup]="line"><td>{{line.controls.description.value}}</td><td><input matInput type="number" formControlName="quantity" aria-label="Cantidad" style="width:80px" /></td><td>{{line.controls.price.value}}</td><td><input matInput type="number" formControlName="discount" aria-label="Descuento" style="width:80px" /></td><td><button mat-icon-button type="button" (click)="remove.emit($index)" aria-label="Quitar producto"><mat-icon>close</mat-icon></button></td></tr>}</tbody></table></div>'})
export class SaleItemsComponent {readonly items=input.required<FormArray<LineForm>>();readonly remove=output<number>();}
