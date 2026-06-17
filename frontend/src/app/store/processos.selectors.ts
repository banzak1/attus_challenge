import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { ProcessosState } from './processos.reducer';

export const selectProcessosState = createFeatureSelector<ProcessosState>('processos');

export const selectAllProcessos = createSelector(
  selectProcessosState,
  (state) => state.processes
);

export const selectProcessosLoading = createSelector(
  selectProcessosState,
  (state) => state.loading
);

export const selectProcessosSaving = createSelector(
  selectProcessosState,
  (state) => state.saving
);

export const selectProcessosError = createSelector(
  selectProcessosState,
  (state) => state.error
);
