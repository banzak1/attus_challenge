import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { ProcessosService } from '../services/processos.service';
import { ProcessosActions } from './processos.actions';

@Injectable()
export class ProcessosEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(ProcessosService);

  loadProcessos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProcessosActions.load),
      mergeMap(() =>
        this.service.listar().pipe(
          map((processos) => ProcessosActions.loadSuccess({ processos })),
          catchError((err) =>
            of(ProcessosActions.loadFailure({ error: err.message || 'Erro ao carregar processos' }))
          )
        )
      )
    )
  );

  createProcesso$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProcessosActions.create),
      mergeMap(({ payload }) =>
        this.service.criar(payload).pipe(
          map((processo) => ProcessosActions.createSuccess({ processo })),
          catchError((err) =>
            of(ProcessosActions.createFailure({ error: err.error?.error || err.message || 'Erro ao criar processo' }))
          )
        )
      )
    )
  );

  updateProcesso$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProcessosActions.update),
      mergeMap(({ id, payload }) =>
        this.service.atualizar(id, payload).pipe(
          map((processo) => ProcessosActions.updateSuccess({ processo })),
          catchError((err) =>
            of(ProcessosActions.updateFailure({ error: err.error?.error || err.message || 'Erro ao atualizar processo' }))
          )
        )
      )
    )
  );

  deleteProcesso$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProcessosActions.delete),
      mergeMap(({ id }) =>
        this.service.deletar(id).pipe(
          map(() => ProcessosActions.deleteSuccess({ id })),
          catchError((err) =>
            of(ProcessosActions.deleteFailure({ error: err.error?.error || err.message || 'Erro ao excluir processo' }))
          )
        )
      )
    )
  );

  // Recarrega a lista após create/update/delete bem-sucedidos
  reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ProcessosActions.createSuccess,
        ProcessosActions.updateSuccess,
        ProcessosActions.deleteSuccess
      ),
      map(() => ProcessosActions.load())
    )
  );
}
