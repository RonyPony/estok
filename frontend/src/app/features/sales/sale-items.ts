import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type LineForm=FormGroup<{productId:FormControl<string>;description:FormControl<string>;categoryName:FormControl<string>;comment:FormControl<string>;quantity:FormControl<number>;discount:FormControl<number>;price:FormControl<number>;taxRate:FormControl<number>}>;
@Component({selector:'app-sale-items',imports:[ReactiveFormsModule,MatInputModule,MatButtonModule,MatIconModule],template:'<div class="table-scroll"><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Descuento</th><th>Detalle</th><th></th></tr></thead><tbody>@for(line of items();track line){<tr [formGroup]="line"><td><strong>{{line.controls.description.value}}</strong>@if(line.controls.categoryName.value){<p class="muted">{{line.controls.categoryName.value}}</p>}</td><td><input matInput type="number" formControlName="quantity" aria-label="Cantidad" min="0.0001" max="1000000" step="0.0001" style="width:80px" /></td><td>{{line.controls.price.value}}</td><td><input matInput type="number" formControlName="discount" aria-label="Descuento" style="width:80px" /></td><td><input matInput formControlName="comment" maxlength="300" aria-label="Detalle del producto" placeholder="Opcional" /></td><td><button mat-icon-button type="button" (click)="remove.emit($index)" aria-label="Quitar producto"><mat-icon>close</mat-icon></button></td></tr>}</tbody></table></div>'})
export class SaleItemsComponent {readonly items=input.required<readonly LineForm[]>();readonly remove=output<number>();}
