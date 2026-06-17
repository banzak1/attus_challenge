// ============================================================
// Tipos TypeScript
// ============================================================

export type StatusProcesso = 'EM_ANDAMENTO' | 'SUSPENSO' | 'CONCLUIDO';

export interface Processo {
  id: number;
  numero_processo: string;
  titulo: string;
  descricao: string | null;
  status: StatusProcesso;
  data_criacao: string;
}

export interface CreateProcessoInput {
  numero_processo: string;
  titulo: string;
  descricao?: string | null;
  status?: StatusProcesso;
}

export interface UpdateProcessoInput {
  titulo?: string;
  descricao?: string | null;
  status?: StatusProcesso;
}

// ============================================================
// Schemas de Validação Fastify (JSON Schema)
// ============================================================

export const processoResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    numero_processo: { type: 'string' },
    titulo: { type: 'string' },
    descricao: { type: ['string', 'null'] },
    status: { type: 'string', enum: ['EM_ANDAMENTO', 'SUSPENSO', 'CONCLUIDO'] },
    data_criacao: { type: 'string' },
  },
} as const;

export const createProcessoSchema = {
  description: 'Dados para criação de um novo processo judicial',
  tags: ['Processos'],
  body: {
    type: 'object',
    required: ['numero_processo', 'titulo'],
    properties: {
      numero_processo: {
        type: 'string',
        minLength: 1,
        description: 'Número único do processo (obrigatório)',
      },
      titulo: {
        type: 'string',
        minLength: 1,
        description: 'Título do processo (obrigatório)',
      },
      descricao: {
        type: 'string',
        nullable: true,
        description: 'Descrição detalhada do processo (opcional)',
      },
      status: {
        type: 'string',
        enum: ['EM_ANDAMENTO', 'SUSPENSO', 'CONCLUIDO'],
        description: 'Status do processo (padrão: EM_ANDAMENTO)',
      },
    },
  },
  response: {
    201: processoResponseSchema,
  },
} as const;

export const updateProcessoSchema = {
  description: 'Dados para atualização parcial de um processo judicial',
  tags: ['Processos'],
  body: {
    type: 'object',
    properties: {
      titulo: {
        type: 'string',
        minLength: 1,
        description: 'Novo título do processo',
      },
      descricao: {
        type: 'string',
        nullable: true,
        description: 'Nova descrição do processo',
      },
      status: {
        type: 'string',
        enum: ['EM_ANDAMENTO', 'SUSPENSO', 'CONCLUIDO'],
        description: 'Novo status do processo',
      },
    },
    minProperties: 1,
  },
  response: {
    200: processoResponseSchema,
  },
} as const;

export const processoParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'integer',
      minimum: 1,
      description: 'ID do processo',
    },
  },
} as const;
