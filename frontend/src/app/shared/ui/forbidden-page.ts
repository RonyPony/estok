import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
@Component({selector:'app-forbidden',imports:[RouterLink,MatButtonModule],template:'<section class="card empty"><h1>Acceso restringido</h1><p>Tu rol no tiene permiso para abrir esta sección. Contacta al administrador de tu empresa.</p><div class="actions"><a mat-button routerLink="/dashboard">Volver al inicio</a><button mat-button (click)="auth.logout()">Cerrar sesión</button></div></section>'})
export class ForbiddenPage {readonly auth=inject(AuthService);}
