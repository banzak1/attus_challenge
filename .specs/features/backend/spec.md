# Backend — API RESTful de Processos Judiciais

## Problem Statement

Procuradorias precisam de um sistema centralizado para gerenciar processos judiciais. A API RESTful é o ponto de entrada único para consultar, criar, atualizar e remover processos, servindo como fonte de verdade para o frontend Angular. O setup deve ser instantâneo (SQLite local, sem containers) e a documentação deve ser auto-gerada via Swagger.

## Goals

- [ ] API RESTful funcional com 5 endpoints documentados em `/docs` (Swagger)
- [ ] Banco SQLite inicializado automaticamente com schema `processos`
- [ ] Validação de entrada em todas as rotas (schemas Fastify nativos)
- [ ] Logs Pino em todas as requisições para diagnóstico
- [ ] Tratamento padronizado de erros (400, 404, 500)
- [ ] CORS liberado para `localhost:4200`
- [ ] Teste básico do Fastify (health check)

## Out of Scope

| Feature                    | Reason                                   |
| -------------------------- | ---------------------------------------- |
| Autenticação / Autorização | Fora do escopo do teste                  |
| Paginação                  | Adição futura se necessário              |
| Migrations                 | Schema único, tabela criada no startup   |
| Containers (Docker)        | SQLite local elimina essa necessidade    |
| Testes de integração/exaustivos | Apenas teste básico do Fastify      |

---

## User Stories

### P1: CRUD de Processos ⭐ MVP

**User Story**: Como consumidor da API (frontend Angular), eu quero criar, ler, atualizar e deletar processos judiciais para gerenciar o ciclo de vida completo de um processo.

**Why P1**: É o core da aplicação. Sem CRUD, o sistema não tem função.

**Acceptance Criteria**:

1. WHEN o servidor iniciar THEN system SHALL criar automaticamente o arquivo `database.db` com a tabela `processos` se ele não existir
2. WHEN `GET /api/processos` for chamado THEN system SHALL retornar array com todos os processos (array vazio se nenhum existir)
3. WHEN `GET /api/processos/:id` for chamado com um ID válido THEN system SHALL retornar o processo correspondente
4. WHEN `GET /api/processos/:id` for chamado com um ID inexistente THEN system SHALL retornar 404 com mensagem padronizada
5. WHEN `POST /api/processos` for chamado com `numero_processo` e `titulo` válidos THEN system SHALL criar o registro e retornar 201 com o processo criado
6. WHEN `POST /api/processos` for chamado sem campos obrigatórios THEN system SHALL retornar 400 com detalhes da validação
7. WHEN `POST /api/processos` for chamado com `numero_processo` duplicado THEN system SHALL retornar 409 (Conflict) com mensagem clara
8. WHEN `PUT /api/processos/:id` for chamado com dados válidos THEN system SHALL atualizar apenas os campos enviados e retornar o registro atualizado
9. WHEN `PUT /api/processos/:id` for chamado com status inválido THEN system SHALL retornar 400 com mensagem de validação
10. WHEN `DELETE /api/processos/:id` for chamado com ID válido THEN system SHALL remover o registro e retornar 204 (No Content)
11. WHEN `DELETE /api/processos/:id` for chamado com ID inexistente THEN system SHALL retornar 404

**Independent Test**: Subir o servidor, acessar `/docs` e executar cada endpoint via Swagger UI.

---

### P2: Documentação Automática

**User Story**: Como desenvolvedor do frontend, eu quero acessar uma interface Swagger com todos os endpoints documentados para entender a API sem ler código.

**Why P2**: Essencial para o avaliador e para o time de frontend, mas não bloqueia o funcionamento da API.

**Acceptance Criteria**:

1. WHEN o servidor iniciar THEN system SHALL expor a interface Swagger UI em `GET /docs`
2. WHEN `GET /docs/json` for chamado THEN system SHALL retornar a spec OpenAPI completa com todos os schemas e rotas
3. WHEN uma rota é registrada THEN system SHALL refleti-la automaticamente na documentação Swagger com schema de request/response

**Independent Test**: Acessar `http://localhost:3000/docs` e verificar se todos os 5 endpoints aparecem com schemas.

---

### P3: Observabilidade e Resiliência

**User Story**: Como desenvolvedor, eu quero logs automáticos de todas as requisições e tratamento de erros consistente para diagnosticar problemas rapidamente.

**Why P3**: Importante para debugging e avaliação, mas a API funciona sem isso.

**Acceptance Criteria**:

1. WHEN qualquer requisição HTTP chegar THEN system SHALL gerar um log Pino automático com método, rota, status e latência
2. WHEN ocorrer um erro interno (500) THEN system SHALL logar o stack trace e retornar resposta JSON padronizada `{ "error": "...", "statusCode": 500 }`
3. WHEN CORS estiver configurado THEN system SHALL permitir requisições de `http://localhost:4200` com métodos GET, POST, PUT, DELETE, OPTIONS
4. WHEN o banco de dados falhar THEN system SHALL retornar 500 com mensagem descritiva (não expor stack trace na resposta)

**Independent Test**: Fazer uma requisição e verificar o terminal para o log Pino. Fazer requisição de origem diferente para testar CORS.

---

## Modelo de Dados

### Tabela: `processos`

| Coluna           | Tipo      | Constraints                          |
| ---------------- | --------- | ------------------------------------ |
| `id`             | INTEGER   | PRIMARY KEY AUTOINCREMENT            |
| `numero_processo`| TEXT      | NOT NULL, UNIQUE                     |
| `titulo`         | TEXT      | NOT NULL                             |
| `descricao`      | TEXT      | NULLABLE                             |
| `status`         | TEXT      | NOT NULL, DEFAULT 'EM_ANDAMENTO', CHECK(status IN ('EM_ANDAMENTO', 'SUSPENSO', 'CONCLUIDO')) |
| `data_criacao`   | TEXT      | NOT NULL, DEFAULT CURRENT_TIMESTAMP  |

---

## Especificação dos Endpoints

### GET /api/processos

- **Response 200**: `Processo[]`

### GET /api/processos/:id

- **Param**: `id` (integer)
- **Response 200**: `Processo`
- **Response 404**: `{ "error": "Processo não encontrado", "statusCode": 404 }`

### POST /api/processos

- **Body**: `{ numero_processo: string, titulo: string, descricao?: string, status?: string }`
- **Response 201**: `Processo`
- **Response 400**: `{ "error": "...", "statusCode": 400 }`
- **Response 409**: `{ "error": "Número de processo já existe", "statusCode": 409 }`

### PUT /api/processos/:id

- **Param**: `id` (integer)
- **Body**: `{ titulo?: string, descricao?: string, status?: string }` (todos opcionais — partial update)
- **Response 200**: `Processo`
- **Response 400**: `{ "error": "...", "statusCode": 400 }`
- **Response 404**: `{ "error": "Processo não encontrado", "statusCode": 404 }`

### DELETE /api/processos/:id

- **Param**: `id` (integer)
- **Response 204**: No Content
- **Response 404**: `{ "error": "Processo não encontrado", "statusCode": 404 }`

---

## Edge Cases

- WHEN `id` não for um número inteiro válido THEN system SHALL retornar 400 (não crashar)
- WHEN body do POST estiver vazio THEN system SHALL retornar 400 com mensagem de validação
- WHEN `numero_processo` for string vazia ou apenas espaços THEN system SHALL retornar 400
- WHEN `titulo` exceder 255 caracteres THEN system SHALL aceitar (TEXT no SQLite não tem limite prático) — ou validar limite razoável
- WHEN `descricao` for nula ou não enviada THEN system SHALL armazenar NULL
- WHEN `status` não for enviado no POST THEN system SHALL usar default 'EM_ANDAMENTO'
- WHEN `status` enviado no PUT for inválido THEN system SHALL retornar 400
- WHEN o arquivo `database.db` for deletado manualmente THEN system SHALL recriá-lo no próximo start
- WHEN múltiplas requisições simultâneas tentarem criar o mesmo `numero_processo` THEN system SHALL garantir unicidade (constraint UNIQUE do SQLite)

---

## Estrutura de Pastas Sugerida

```
backend/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── server.ts          # Ponto de entrada: instancia Fastify, registra plugins, inicia
    ├── config/
    │   └── database.ts    # Inicialização do SQLite + schema DDL
    ├── routes/
    │   └── processos.ts   # Registro das 5 rotas com schemas de validação
    ├── controllers/
    │   └── processos.ts   # Lógica de negócio (operações CRUD no banco)
    └── schemas/
        └── processos.ts   # Schemas Fastify + tipos TypeScript
```

---

## Requirement Traceability

| Requirement ID | Story                | Phase  | Status  |
| -------------- | -------------------- | ------ | ------- |
| BACK-01        | P1: CRUD             | Spec   | Verified |
| BACK-02        | P1: Validação        | Spec   | Verified |
| BACK-03        | P1: Unicidade        | Spec   | Verified |
| BACK-04        | P2: Swagger          | Spec   | Verified |
| BACK-05        | P3: Logs Pino        | Spec   | Verified |
| BACK-06        | P3: Tratamento Erros | Spec   | Verified |
| BACK-07        | P3: CORS             | Spec   | Verified |
| BACK-08        | P1: Teste básico     | Spec   | Verified |

**Coverage:** 8 total, 8 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] `npm install && npm start` sobe o servidor em < 5 segundos
- [ ] Swagger UI acessível em `http://localhost:3000/docs` com 5 endpoints documentados
- [ ] Todos os 5 endpoints respondem corretamente no Swagger (teste manual)
- [ ] Erro 400 ao enviar POST sem `numero_processo`
- [ ] Erro 404 ao buscar ID inexistente
- [ ] Log Pino visível no terminal a cada requisição
- [ ] Frontend Angular consegue consumir a API (CORS ok)
