export type StatusProcesso = 'EM_ANDAMENTO' | 'SUSPENSO' | 'CONCLUIDO';

export interface Processo {
  id: number;
  numero_processo: string;
  titulo: string;
  descricao: string | null;
  status: StatusProcesso;
  data_criacao: string;
}

export interface CreateProcessoPayload {
  numero_processo: string;
  titulo: string;
  descricao?: string | null;
  status?: StatusProcesso;
}

export interface UpdateProcessoPayload {
  titulo?: string;
  descricao?: string | null;
  status?: StatusProcesso;
}
