# Gerenciador de Processos Judiciais

**Vision:** API RESTful + SPA Angular para gerenciamento de processos judiciais em Procuradorias — CRUD completo, setup zero-atrito (SQLite local, sem containers), documentação Swagger automática e UI reativa com Material Design.
**For:** Avaliadores técnicos e procuradores que precisam consultar e gerenciar processos.
**Solves:** Centralizar o cadastro e acompanhamento de processos judiciais com uma interface moderna, responsiva e de setup instantâneo.

## Goals

- [ ] **Backend funcional em < 1 minuto de setup** — `npm install && npm start` sobe API com Swagger em `/docs`
- [ ] **Frontend reativo e profissional** — Dashboard com tabela, CRUD via modal, estados vazios/de loading/erro
- [ ] **Cobertura de ponta a ponta** — 5 endpoints REST documentados, 5 operações na UI, logs de diagnóstico no terminal
- [ ] **Código avaliável** — Separação de camadas (rotas/controladores/serviços), tipagem TypeScript, arquitetura limpa

## Tech Stack

**Core:**

- Framework Backend: Fastify (Node.js)
- Linguagem: TypeScript
- Framework Frontend: Angular 17+ (Standalone Components)
- Banco de Dados: SQLite (better-sqlite3, arquivo local `.db`)
- UI Kit: Angular Material
- Estado Global: NgRx (Store, Actions, Selectors, Effects)
- Estado Local: Angular Signals

**Key dependencies:**

- Backend: `fastify`, `@fastify/swagger`, `@fastify/swagger-ui`, `@fastify/cors`, `better-sqlite3`, `pino`
- Frontend: `@angular/material`, `@ngrx/store`, `@ngrx/effects`, `rxjs`, `jest` + `jest-preset-angular`
- Ferramentas: `tsx` (dev runner backend), `@angular/cli`

## Scope

**v1 includes:**

- [Backend] Inicialização automática do banco SQLite com schema `processos`
- [Backend] CRUD completo: GET (lista), GET/:id, POST, PUT/:id, DELETE/:id
- [Backend] Validação de entrada via schemas nativos do Fastify
- [Backend] Swagger UI auto-gerado em `/docs`
- [Backend] Logs Pino em todas as requisições
- [Backend] Tratamento padronizado de erros (400, 404, 500)
- [Backend] Teste básico do Fastify (health check ou endpoint)
- [Frontend] Dashboard com `mat-table` listando processos (NgRx + async pipe)
- [Frontend] Modal/rota de criação e edição com Reactive Forms
- [Frontend] Signals para estado local do formulário (loading, validação)
- [Frontend] Exclusão de processo com confirmação
- [Frontend] Configuração do Jest + jest-preset-angular (remover Karma/Jasmine)
- [Frontend] Testes unitários .spec.ts: 1 serviço + 1 componente (Jest)
- [README] Instruções de setup e links para API + Swagger + Frontend

**Explicitly out of scope:**

| Feature                         | Reason                                        |
| ------------------------------- | --------------------------------------------- |
| Autenticação (JWT, login)       | Fora do escopo do teste; foco em CRUD e estado |
| Autorização por perfil/permissão| Sem sistema de usuários                       |
| Containers (Docker)             | Setup zero-atrito com SQLite local            |
| Paginação no backend            | Pode ser adicionada como melhoria futura      |
| Upload/anexo de documentos      | Fora do escopo v1                             |
| Deploy/hospedagem               | Execução local apenas                         |
| Testes E2E (Cypress/Playwright) | Cobertura de testes focada em unitários       |

## Constraints

- Timeline: Entrega de teste técnico (prazo definido pelo avaliador)
- Technical: SQLite local (sem containers), Node.js + Angular 17+, TypeScript obrigatório
- Resources: Desenvolvedor único, execução local (Windows/Linux/Mac)
