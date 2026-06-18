# Nota Técnica — Decisões e Trade-offs

## Por que Fastify e não Express?

Fui com Fastify por três motivos principais:

1. **Validação nativa** — cada rota declara um JSON Schema e o Fastify valida request/response sozinho. No Express eu precisaria de Joi/Zod + middleware + configurar o Swagger manualmente. Aqui o Swagger sai de graça dos mesmos schemas.

2. **Performance** — Fastify é mais rápido que Express nos benchmarks, mas honestamente isso não faz diferença pra esse projeto. O que fez diferença foi o item 1.

3. **Pino integrado** — `logger: true` e pronto. Toda requisição gera log com método, rota, status e latência sem escrever uma linha de middleware.

## Por que SQLite e não PostgreSQL?

O requisito era "atrito zero de setup". Um `npm install && npm start` que sobe tudo. Com PostgreSQL o avaliador precisaria ter Docker ou um PG instalado, configurar conexão, etc.

SQLite resolve isso: o banco é um arquivo `.db` criado automaticamente no primeiro start. A contrapartida é que ele não lida bem com múltiplos escritores simultâneos — documentei essa limitação no [relatório de incidente](INCIDENT_REPORT.md).

Se o projeto crescesse, migrar para PostgreSQL com Prisma seria o caminho natural.

## NgRx + Signals: por que os dois juntos?

O teste pedia pra demonstrar coexistência das duas abordagens. Cada uma foi usada onde faz mais sentido:

- **NgRx**: estado global que atravessa componentes (lista de processos, loading, erro). Effects pra orchestrar chamadas HTTP. Selectors pra ler o estado de forma tipada. Store DevTools pra debugar.

- **Signals**: estado local que só interessa a um componente. No formulário, `isSaving` controla o loading do botão e a validação do form desabilita/ habilita o Salvar. É reativo, sem boilerplate de action/reducer.

A regra foi: se o dado aparece em mais de um componente, vai pra Store. Se é efêmero e local, fica em Signal. O formulário não duplica a lista de processos — recebe o que precisa via `MAT_DIALOG_DATA` e devolve o resultado.

## Zoneless Change Detection

Angular 18+ permite rodar sem Zone.js. O projeto usa `provideZonelessChangeDetection()`:

- Bundle menor (~15KB a menos)
- Performance um pouco melhor
- Stack traces mais limpos

O lado ruim é que o desenvolvedor precisa ser mais cuidadoso com subscriptions — sem Zone.js, o Angular não detecta mudanças automaticamente em callbacks. Mas isso se resolve com `async` pipe nos templates e `takeUntilDestroyed()` nos subscribes manuais. Coisa que já era boa prática antes.

## Jest em vez de Karma/Jasmine

Era obrigatório no escopo. O `jest-preset-angular` com setup zoneless (`setupZonelessTestEnv`) funciona bem. Usei `HttpClientTestingController` pra mockar chamadas HTTP e `MockStore` pra simular o estado do NgRx nos testes de componente. Mais rápido que Karma porque roda em JSDOM em vez de browser.

## Prevenção de Memory Leaks

Toda subscription no frontend segue um destes dois padrões:

```typescript
// Template: async pipe → auto unsubscribe
processos$ = this.store.select(selectAllProcessos);

// Código: takeUntilDestroyed → cleanup quando componente morre
this.store.select(selectError)
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(error => this.snackBar.open(error));
```

Nenhum Observable fica órfão. Prefiro `async` pipe sempre que dá — o Angular gerencia o ciclo de vida. Só uso `subscribe` manual quando preciso de efeito colateral (ex: abrir snackbar).

## Testes

| O que | Como | Quantos |
|---|---|---|
| API (backend) | Vitest + `app.inject()` sem subir servidor | 10 |
| HTTP service (frontend) | Jest + `HttpClientTestingController` | 5 |
| Dashboard (frontend) | Jest + `MockStore` + `TestBed` | 6 |

Backend testa os 5 endpoints com todos os status code (200, 201, 204, 400, 404, 409). Frontend testa se o serviço monta as chamadas HTTP corretas e se o componente renderiza os estados de loading, vazio, tabela com dados e status chips.

## O que daria pra melhorar

**Agora (baixo esforço):**
- Paginação na tabela (mat-paginator + query params no backend)
- Ordenação por coluna (matSort)
- Campo de busca com debounce

**Mais pra frente (médio esforço):**
- Migrar pra PostgreSQL quando concorrência de escrita crescer
- Testes E2E com Playwright
- Dark mode via theming do Material

**Se virasse produto real (alto esforço):**
- Autenticação JWT + OAuth de procuradorias
- Upload de documentos (PDFs anexados aos processos)
- WebSocket pra notificações em tempo real
- Cache com Redis
- OpenTelemetry pra observabilidade
