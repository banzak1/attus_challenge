# Roadmap — Gerenciador de Processos Judiciais

## v1 — Entrega do Teste Técnico

### M1: Fundação do Backend

**Objetivo:** API rodando, banco inicializado, Swagger acessível.

- Inicializar projeto Node.js + TypeScript + Fastify
- Configurar SQLite com `better-sqlite3` e schema `processos`
- Implementar CRUD completo (5 endpoints em `/api/processos`)
- Configurar `@fastify/swagger` + `@fastify/swagger-ui` em `/docs`
- Configurar `@fastify/cors` para `localhost:4200`
- Tratamento de erros padronizado (400, 404, 500)
- Logs Pino (`logger: true`)
- Teste básico do Fastify (Jest ou Vitest)

**Critério de conclusão:** `npm install && npm start` → Swagger acessível, todos os endpoints respondendo.

### M2: Fundação do Frontend

**Objetivo:** Projeto Angular gerado, Material configurado, NgRx store operacional, Jest no lugar de Karma/Jasmine.

- Gerar projeto Angular 17+ standalone com SCSS e roteamento
- Remover Karma/Jasmine; instalar e configurar `jest` + `jest-preset-angular`
- Instalar Angular Material + tema
- Configurar NgRx (Store, Actions, Reducers, Effects, Selectors)
- Criar `ProcessosService` (HTTP wrapper para API)
- Criar store de processos (load, create, update, delete)

**Critério de conclusão:** App Angular compila, store carrega dados da API, `npm test` executa Jest.

### M3: Dashboard e CRUD

**Objetivo:** Tela principal funcional com todas as operações.

- Dashboard com `mat-table` (colunas: Número, Título, Status, Ações)
- Modal/Rota de criação com Reactive Forms
- Modal/Rota de edição (preenchido com dados existentes)
- Exclusão com `mat-dialog` de confirmação
- Signals para estado local do formulário (loading, validação, desabilitar botão)
- Estados: vazio (sem processos), loading (spinner), erro (snackbar/alert)

**Critério de conclusão:** CRUD completo via UI — criar, listar, editar, excluir processos.

### M4: Testes e Polimento

**Objetivo:** Cobertura de testes, memory leak prevention, documentação final.

- Testes unitários Jest: `ProcessosService` (HTTP mock via `HttpClientTestingController`) + 1 componente (render + interação)
- `takeUntilDestroyed` ou `async` pipe em todos os Observables
- Revisão de acessibilidade Material (labels, aria, contraste)
- Atualizar README.md com link do frontend e decisões arquiteturais (NgRx vs Signals, memory leak prevention)
- README.md final com instruções de execução para ambos os projetos

**Critério de conclusão:** `npm test` passa em ambos os projetos, sem memory leaks, README completo.

---

## Futuro (pós-teste)

| Feature | Notas |
|---------|-------|
| Paginação e filtros na tabela | Backend: query params `?page=&limit=`, Frontend: `mat-paginator` |
| Ordenação por colunas | `matSort` + backend `?sort=coluna&order=asc` |
| Busca por número/título | Campo de busca com debounce no NgRx |
| Dashboard com contadores | Cards: "Em andamento (12)", "Suspensos (3)", "Concluídos (45)" |
| Dark mode | Toggle via Angular Material theming |
| Testes E2E | Playwright ou Cypress no fluxo CRUD completo |
| Exportar CSV/PDF | Botão de exportação da tabela filtrada |
