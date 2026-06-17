import { FastifyInstance } from 'fastify';
import {
  createProcessoSchema,
  updateProcessoSchema,
  processoParamsSchema,
  processoResponseSchema,
} from '../schemas/processos';
import {
  listarProcessos,
  buscarProcessoPorId,
  criarProcesso,
  atualizarProcesso,
  deletarProcesso,
  verificarNumeroProcessoDuplicado,
} from '../controllers/processos';

export async function processosRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/processos — Listar todos
  app.get(
    '/',
    {
      schema: {
        description: 'Retorna a lista de todos os processos judiciais',
        tags: ['Processos'],
        response: {
          200: {
            type: 'array',
            items: processoResponseSchema,
          },
        },
      },
    },
    async (_request, _reply) => {
      return listarProcessos();
    }
  );

  // GET /api/processos/:id — Buscar por ID
  app.get(
    '/:id',
    {
      schema: {
        description: 'Retorna os detalhes de um processo judicial específico',
        tags: ['Processos'],
        params: processoParamsSchema,
        response: {
          200: processoResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const processo = buscarProcessoPorId(id);

      if (!processo) {
        return reply.status(404).send({
          error: 'Processo não encontrado',
          statusCode: 404,
        });
      }

      return processo;
    }
  );

  // POST /api/processos — Criar
  app.post(
    '/',
    {
      schema: createProcessoSchema,
    },
    async (request, reply) => {
      const input = request.body as {
        numero_processo: string;
        titulo: string;
        descricao?: string | null;
        status?: string;
      };

      // Verifica duplicidade de numero_processo
      if (verificarNumeroProcessoDuplicado(input.numero_processo)) {
        return reply.status(409).send({
          error: 'Número de processo já existe',
          statusCode: 409,
        });
      }

      const processo = criarProcesso({
        numero_processo: input.numero_processo,
        titulo: input.titulo,
        descricao: input.descricao,
        status: input.status as 'EM_ANDAMENTO' | 'SUSPENSO' | 'CONCLUIDO' | undefined,
      });

      return reply.status(201).send(processo);
    }
  );

  // PUT /api/processos/:id — Atualizar
  app.put(
    '/:id',
    {
      schema: {
        ...updateProcessoSchema,
        params: processoParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };
      const input = request.body as {
        titulo?: string;
        descricao?: string | null;
        status?: string;
      };

      // Verifica se o processo existe
      const existente = buscarProcessoPorId(id);
      if (!existente) {
        return reply.status(404).send({
          error: 'Processo não encontrado',
          statusCode: 404,
        });
      }

      const processo = atualizarProcesso(id, {
        titulo: input.titulo,
        descricao: input.descricao,
        status: input.status as 'EM_ANDAMENTO' | 'SUSPENSO' | 'CONCLUIDO' | undefined,
      });

      return processo;
    }
  );

  // DELETE /api/processos/:id — Remover
  app.delete(
    '/:id',
    {
      schema: {
        description: 'Remove um processo judicial do banco de dados',
        tags: ['Processos'],
        params: processoParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };

      const deletado = deletarProcesso(id);

      if (!deletado) {
        return reply.status(404).send({
          error: 'Processo não encontrado',
          statusCode: 404,
        });
      }

      return reply.status(204).send();
    }
  );
}
