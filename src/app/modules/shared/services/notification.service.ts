import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

const DURATION_MS = 4000;

/** Escrita que deu 503: o banco caiu e o gateway não mudou nada. */
export const DATABASE_DOWN_NOTICE = 'Banco do gateway fora do ar; nada mudou.';

/** Aviso curto no rodapé (snackbar) para o resultado de uma ação; erro de página continua no `got-error-state`. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  notify(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: DURATION_MS });
  }
}
