import { createReducer, on } from '@ngrx/store';
import type { Processo } from '../models/processo.model';
import { ProcessosActions } from './processos.actions';

export interface ProcessosState {
  processes: Processo[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const initialState: ProcessosState = {
  processes: [],
  loading: false,
  saving: false,
  error: null,
};

export const processsReducer = createReducer(
  initialState,

  // Load
  on(ProcessosActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProcessosActions.loadSuccess, (state, { processos }) => ({
    ...state,
    processes: processos,
    loading: false,
  })),
  on(ProcessosActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create
  on(ProcessosActions.create, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(ProcessosActions.createSuccess, (state, { processo }) => ({
    ...state,
    processes: [...state.processes, processo],
    saving: false,
  })),
  on(ProcessosActions.createFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),

  // Update
  on(ProcessosActions.update, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(ProcessosActions.updateSuccess, (state, { processo }) => ({
    ...state,
    processes: state.processes.map((p) => (p.id === processo.id ? processo : p)),
    saving: false,
  })),
  on(ProcessosActions.updateFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),

  // Delete
  on(ProcessosActions.delete, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(ProcessosActions.deleteSuccess, (state, { id }) => ({
    ...state,
    processes: state.processes.filter((p) => p.id !== id),
    saving: false,
  })),
  on(ProcessosActions.deleteFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  }))
);
