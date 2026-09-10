import { Component, input, output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
export interface TableColumn { key: string; label: string; }
export type TableRow = Record<string, string | number | boolean | null | undefined>;
@Component({ selector: 'app-table', imports: [MatPaginatorModule, MatProgressBarModule, MatButtonModule, MatIconModule], template: '@if(loading()){<mat-progress-bar mode="indeterminate" />}<div class="table-scroll"><table><thead><tr>@for(column of columns();track column.key){<th>{{column.label}}</th>}@if(actionLabel()){<th>Acciones</th>}</tr></thead><tbody>@for(row of rows();track row["id"]){<tr>@for(column of columns();track column.key){<td>{{row[column.key] ?? "—"}}</td>}@if(actionLabel()){<td><button mat-button (click)="selected.emit(row)">{{actionLabel()}}</button></td>}</tr>}</tbody></table></div>@if(!loading() && rows().length === 0){<div class="empty"><mat-icon>inbox</mat-icon><h3>{{emptyText()}}</h3><p>Los registros aparecerán aquí cuando los agregues.</p></div>}<mat-paginator [length]="total()" [pageIndex]="page() - 1" [pageSize]="20" [hidePageSize]="true" (page)="changePage($event)" aria-label="Paginación" />' })
export class AppTable {
  readonly rows = input.required<TableRow[]>(); readonly columns = input.required<TableColumn[]>(); readonly loading = input(false); readonly total = input(0); readonly page = input(1); readonly actionLabel = input('Ver detalle'); readonly emptyText = input('Todavía no hay registros'); readonly selected = output<TableRow>(); readonly pageChange = output<number>();
  changePage(event: PageEvent) { this.pageChange.emit(event.pageIndex + 1); }
}
