import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
@Component({selector:'app-forbidden',imports:[MatButtonModule],template:'<section class="card empty"><h1>Acceso restringido</h1><p>Tu rol no tiene permiso para abrir esta sección. Contacta al administrador de tu empresa.</p><button mat-button (click)="auth.logout()">Cerrar sesión</button></section>'})
export class ForbiddenPage {readonly auth=inject(AuthService);}
