import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs';

import { ProcessosActions } from '../../store/processos.actions';
import {
  selectAllProcessos,
  selectProcessosLoading,
  selectProcessosSaving,
  selectProcessosError,
} from '../../store/processos.selectors';
import type { Processo } from '../../models/processo.model';
import { ProcessoFormComponent } from '../../components/processo-form/processo-form.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AsyncPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly processos$ = this.store.select(selectAllProcessos);
  readonly loading$ = this.store.select(selectProcessosLoading);
  readonly saving$ = this.store.select(selectProcessosSaving);

  readonly displayedColumns: string[] = ['numero_processo', 'titulo', 'status', 'acoes'];

  ngOnInit(): void {
    this.store.dispatch(ProcessosActions.load());

    // Exibe snackbar em caso de erro
    this.store
      .select(selectProcessosError)
      .pipe(
        filter((error) => error !== null),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((error) => {
        this.snackBar.open(error!, 'Fechar', { duration: 5000 });
      });
  }

  abrirFormulario(processo?: Processo): void {
    const dialogRef = this.dialog.open(ProcessoFormComponent, {
      width: '520px',
      data: processo || null,
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result) return; // cancelado

        if (processo) {
          // Modo edição
          this.store.dispatch(
            ProcessosActions.update({ id: processo.id, payload: result })
          );
        } else {
          // Modo criação
          this.store.dispatch(ProcessosActions.create({ payload: result }));
        }
      });
  }

  confirmarExclusao(processo: Processo): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Confirmar Exclusão',
        mensagem: `Tem certeza que deseja excluir o processo "${processo.numero_processo}"?`,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmado) => {
        if (confirmado) {
          this.store.dispatch(ProcessosActions.delete({ id: processo.id }));
        }
      });
  }
}
