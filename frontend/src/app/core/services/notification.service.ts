import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackbar = inject(MatSnackBar);
  success(message: string) { this.show(message); }
  error(message: string) { this.show(message, 6000); }
  warning(message: string) { this.show(message); }
  info(message: string) { this.show(message); }
  private show(message: string, duration = 3500) { this.snackbar.open(message, 'Cerrar', { duration, horizontalPosition: 'end', verticalPosition: 'top' }); }
}
