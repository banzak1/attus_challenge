import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { processosRoutes } from '../routes/processos';
import { getDatabase, closeDatabase } from '../config/database';

// Garante que o banco de teste use um arquivo separado
process.env.DB_PATH = ':memory:';

let app: ReturnType<typeof Fastify>;

beforeAll(async () => {
  app = Fastify({ logger: false });

  await app.register(fastifyCors, {
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await app.register(async (scoped) => {
    await processosRoutes(scoped);
  }, { prefix: '/api/processos' });

  await app.ready();
});

afterAll(async () => {
  await app.close();
  closeDatabase();
});

describe('API de Processos', () => {
  it('GET /api/processos — retorna lista vazia inicialmente', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/processos',
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual([]);
  });

  it('POST /api/processos — cria um novo processo', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/processos',
      payload: {
        numero_processo: '0001-01.2026',
        titulo: 'Processo de Teste',
        descricao: 'Descrição do processo de teste',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body.id).toBe(1);
    expect(body.numero_processo).toBe('0001-01.2026');
    expect(body.titulo).toBe('Processo de Teste');
    expect(body.status).toBe('EM_ANDAMENTO');
  });

  it('POST /api/processos — rejeita campos obrigatórios ausentes', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/processos',
      payload: {
        descricao: 'Faltando dados obrigatórios',
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.statusCode).toBe(400);
  });

  it('POST /api/processos — rejeita numero_processo duplicado', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/processos',
      payload: {
        numero_processo: '0001-01.2026',
        titulo: 'Outro processo',
      },
    });

    expect(response.statusCode).toBe(409);
    const body = JSON.parse(response.payload);
    expect(body.error).toContain('já existe');
  });

  it('GET /api/processos/:id — retorna processo existente', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/processos/1',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.id).toBe(1);
    expect(body.numero_processo).toBe('0001-01.2026');
  });

  it('GET /api/processos/:id — retorna 404 para ID inexistente', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/processos/999',
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.payload);
    expect(body.error).toContain('não encontrado');
  });

  it('PUT /api/processos/:id — atualiza processo existente', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/api/processos/1',
      payload: {
        titulo: 'Processo Atualizado',
        status: 'SUSPENSO',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.titulo).toBe('Processo Atualizado');
    expect(body.status).toBe('SUSPENSO');
    expect(body.numero_processo).toBe('0001-01.2026'); // não mudou
  });

  it('PUT /api/processos/:id — retorna 404 para ID inexistente', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/api/processos/999',
      payload: { titulo: 'Nova tentativa' },
    });

    expect(response.statusCode).toBe(404);
  });

  it('DELETE /api/processos/:id — remove processo existente', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/processos/1',
    });

    expect(response.statusCode).toBe(204);
  });

  it('DELETE /api/processos/:id — retorna 404 para ID já removido', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/processos/1',
    });

    expect(response.statusCode).toBe(404);
  });
});
