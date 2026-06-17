import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import { processosRoutes } from './routes/processos';
import { closeDatabase } from './config/database';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  // ============================================================
  // CORS — permite frontend Angular (localhost:4200)
  // ============================================================
  await app.register(fastifyCors, {
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // ============================================================
  // Swagger — documentação OpenAPI
  // ============================================================
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Gerenciador de Processos Judiciais — API',
        description: 'API RESTful para gerenciamento de processos judiciais de Procuradorias',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Servidor local',
        },
      ],
      tags: [
        { name: 'Processos', description: 'Endpoints de gerenciamento de processos judiciais' },
      ],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });

  // ============================================================
  // Rotas da API
  // ============================================================
  await app.register(
    async (scopedApp) => {
      await processosRoutes(scopedApp);
    },
    { prefix: '/api/processos' }
  );

  // ============================================================
  // Tratamento global de erros
  // ============================================================
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    // Erro de validação do Fastify
    if (error.validation) {
      return reply.status(400).send({
        error: 'Erro de validação',
        statusCode: 400,
        detalhes: error.message,
      });
    }

    // Erro interno
    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      error: statusCode === 500 ? 'Erro interno do servidor' : error.message,
      statusCode,
    });
  });

  // ============================================================
  // Health check
  // ============================================================
  app.get('/api/health', {
    schema: {
      description: 'Health check da API',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  });

  return app;
}

async function start() {
  const app = await buildServer();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    app.log.info(`Recebido sinal ${signal}. Encerrando servidor...`);
    await app.close();
    closeDatabase();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Swagger disponível em http://localhost:${PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
