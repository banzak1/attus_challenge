import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { Processo, CreateProcessoPayload, UpdateProcessoPayload } from '../models/processo.model';

export const ProcessosActions = createActionGroup({
  source: 'Processos',
  events: {
    // Carregar lista
    'Load': emptyProps(),
    'Load Success': props<{ processos: Processo[] }>(),
    'Load Failure': props<{ error: string }>(),

    // Criar
    'Create': props<{ payload: CreateProcessoPayload }>(),
    'Create Success': props<{ processo: Processo }>(),
    'Create Failure': props<{ error: string }>(),

    // Atualizar
    'Update': props<{ id: number; payload: UpdateProcessoPayload }>(),
    'Update Success': props<{ processo: Processo }>(),
    'Update Failure': props<{ error: string }>(),

    // Deletar
    'Delete': props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ error: string }>(),
  },
});
