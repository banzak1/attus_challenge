import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  titulo: string;
  mensagem: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  styles: [
    '.dialog-content { display: flex; align-items: flex-start; gap: 16px; padding-top: 8px; }',
    '.warn-icon { color: var(--mat-sys-error, #d32f2f); font-size: 28px; width: 28px; height: 28px; flex-shrink: 0; }',
    '.dialog-message { margin: 0; line-height: 1.6; }',
    '.dialog-actions { padding: 16px 24px 20px; gap: 12px; border-top: 1px solid var(--mat-sys-outline-variant); }',
  ],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>
      <div class="dialog-content">
        <mat-icon class="warn-icon">warning</mat-icon>
        <p class="dialog-message">{{ data.mensagem }}</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-stroked-button (click)="dialogRef.close(false)">Cancelar</button>
      <button mat-flat-button color="warn" (click)="dialogRef.close(true)">
        <mat-icon>delete_outline</mat-icon>
        Excluir
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
