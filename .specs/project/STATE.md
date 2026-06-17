# State — Gerenciador de Processos Judiciais

## Decisions

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| D01 | SQLite local (better-sqlite3) para persistência | Setup zero-atrito, sem containers | 2026-06-17 |
| D02 | NgRx (global) + Signals (local) coexistindo | Demonstrar domínio de ambas abordagens no teste | 2026-06-17 |
| D03 | Jest + jest-preset-angular como framework de testes | Obrigatório no escopo do frontend; remover Karma/Jasmine | 2026-06-17 |
| D04 | Sem autenticação (sem JWT/login) | Fora do escopo; foco em CRUD e estado | 2026-06-17 |
| D05 | Backend com Fastify (não Express) | Exigência do teste: validação nativa, alta performance | 2026-06-17 |
| D06 | Angular 17+ Standalone Components | Exigência do teste: arquitetura moderna sem NgModules | 2026-06-17 |

## Blockers

Nenhum no momento.

## Todos

- [x] Criar spec detalhada do Backend (M1)
- [x] Criar spec detalhada do Frontend (M2-M4)
- [x] Implementar Backend
- [x] Implementar Frontend

## Lessons Learned

*(Registrar aqui aprendizados durante o desenvolvimento)*

## Deferred Ideas

- Paginação e filtros na tabela (pós-teste)
- Ordenação por colunas via backend (pós-teste)
- Campo de busca com debounce (pós-teste)
- Dashboard com cards contadores (pós-teste)
- Dark mode toggle (pós-teste)
- Testes E2E (pós-teste)
- Exportação CSV/PDF (pós-teste)
