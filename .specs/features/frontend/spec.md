# Frontend — Dashboard de Processos Judiciais (Angular)

## Problem Statement

Procuradores precisam de uma interface visual para gerenciar processos judiciais sem depender de chamadas diretas à API. O frontend deve oferecer uma experiência fluida com tabela de listagem, formulários reativos para criação/edição, e exclusão com confirmação — tudo com estado gerenciado de forma profissional (NgRx global + Signals local) e sem memory leaks.

## Goals

- [ ] Dashboard funcional com `mat-table` listando processos da API
- [ ] CRUD completo via UI: criar, editar (modal/rota), excluir (com diálogo de confirmação)
- [ ] NgRx para estado global (lista de processos) + Signals para estado local de formulários
- [ ] Zero memory leaks: `takeUntilDestroyed` ou `async` pipe em todos os Observables
- [ ] Testes unitários com Jest: `ProcessosService` + 1 componente principal
- [ ] Setup Angular 17+ standalone (sem NgModules) com Angular Material

## Out of Scope

| Feature                     | Reason                                      |
| --------------------------- | ------------------------------------------- |
| Autenticação / Tela de login| API não tem auth; sem necessidade           |
| Paginação na tabela         | Melhoria futura                             |
| Ordenação por coluna        | Melhoria futura                             |
| Filtros avançados / busca   | Melhoria futura                             |
| Upload de documentos        | Fora do escopo v1                           |
| Testes E2E                  | Cobertura focada em unitários               |
| Responsivo mobile            | Foco desktop; Material já adapta básico     |

---

## User Stories

### P1: Dashboard com Listagem de Processos ⭐ MVP

**User Story**: Como procurador, eu quero visualizar todos os processos judiciais em uma tabela para ter uma visão geral do acervo.

**Why P1**: É a tela principal. Sem ela, o sistema não tem ponto de entrada visual.

**Acceptance Criteria**:

1. WHEN a página carregar THEN system SHALL disparar uma action NgRx para carregar processos da API via Effect
2. WHEN os dados chegarem da API THEN system SHALL armazená-los na Store e exibi-los na `mat-table` via seletor (async pipe ou toSignal)
3. WHEN a API retornar erro THEN system SHALL exibir mensagem de erro (snackbar ou alert)
4. WHEN a lista estiver vazia THEN system SHALL exibir estado vazio amigável ("Nenhum processo cadastrado")
5. WHEN os dados estiverem carregando THEN system SHALL exibir indicador de loading (spinner ou progress bar)
6. WHEN o componente for destruído THEN system SHALL liberar todos os Observables (takeUntilDestroyed ou async pipe)

**Independent Test**: Subir backend + frontend, acessar a página e ver a tabela carregar os processos (ou estado vazio se o banco estiver limpo).

---

### P2: Criação de Processo

**User Story**: Como procurador, eu quero cadastrar um novo processo judicial preenchendo um formulário para incluí-lo no sistema.

**Why P2**: Essencial para alimentar o sistema com dados, mas a visualização (P1) vem primeiro.

**Acceptance Criteria**:

1. WHEN o usuário clicar em "Novo Processo" THEN system SHALL abrir um modal (ou navegar para rota de criação) com formulário Reactive Forms
2. WHEN o formulário abrir THEN system SHALL exibir campos: Número do Processo (required), Título (required), Descrição (opcional), Status (select com opções do enum)
3. WHEN o formulário estiver inválido (campos obrigatórios vazios) THEN system SHALL desabilitar o botão "Salvar" via Signal reativa
4. WHEN o usuário preencher todos os campos obrigatórios corretamente e clicar em "Salvar" THEN system SHALL disparar ação de criação via NgRx Effect, chamar a API, e fechar o modal/redirecionar ao atualizar a tabela
5. WHEN a API retornar erro de validação (400) ou conflito (409) THEN system SHALL exibir a mensagem de erro no formulário ou via snackbar
6. WHEN o salvamento estiver em progresso THEN system SHALL desabilitar o botão e mostrar spinner (Signal: `saving() === true`)

**Independent Test**: Clicar "Novo Processo", preencher formulário, salvar, e ver o processo aparecer na tabela.

---

### P3: Edição de Processo

**User Story**: Como procurador, eu quero editar os dados de um processo existente para manter as informações atualizadas.

**Why P3**: Complementa o CRUD, mas a criação (P2) é mais crítica para o MVP.

**Acceptance Criteria**:

1. WHEN o usuário clicar em "Editar" na linha da tabela THEN system SHALL abrir modal com formulário pré-preenchido com os dados atuais do processo
2. WHEN o formulário de edição abrir THEN system SHALL exibir os mesmos campos do formulário de criação, com `numero_processo` desabilitado (não editável)
3. WHEN o usuário modificar campos e clicar "Salvar" THEN system SHALL disparar action de atualização via NgRx, chamar PUT na API, e atualizar a tabela
4. WHEN o processo não for encontrado (404) THEN system SHALL exibir erro apropriado

**Independent Test**: Clicar "Editar" em um processo existente, modificar o título, salvar, e ver a tabela refletir a mudança.

---

### P4: Exclusão de Processo

**User Story**: Como procurador, eu quero remover um processo do sistema quando ele não for mais necessário.

**Why P4**: Fecha o CRUD. Menos crítico que criação/edição, mas necessário.

**Acceptance Criteria**:

1. WHEN o usuário clicar em "Excluir" na linha da tabela THEN system SHALL abrir um `mat-dialog` de confirmação ("Tem certeza que deseja excluir o processo X?")
2. WHEN o usuário confirmar a exclusão THEN system SHALL disparar action de deleção via NgRx, chamar DELETE na API, e remover o processo da tabela
3. WHEN o usuário cancelar no diálogo THEN system SHALL fechar o diálogo sem excluir
4. WHEN a API retornar erro THEN system SHALL exibir mensagem de erro

**Independent Test**: Clicar "Excluir", confirmar, e ver o processo sumir da tabela.

---

## Edge Cases

- WHEN a API estiver offline (conexão recusada) THEN system SHALL exibir erro amigável e NÃO quebrar a aplicação
- WHEN o usuário submeter o formulário com espaços em branco nos campos obrigatórios THEN system SHALL validar e rejeitar
- WHEN o número do processo já existir (409 Conflict) THEN system SHALL exibir "Este número de processo já está cadastrado"
- WHEN o usuário clicar "Salvar" múltiplas vezes rapidamente THEN system SHALL ignorar cliques enquanto `saving` for true (Signal)
- WHEN o modal for fechado sem salvar THEN system SHALL descartar os dados do formulário (reset)
- WHEN a tabela tiver muitos processos (>100) THEN system SHALL manter performance aceitável (sem virtual scroll, mas sem travar)
- WHEN o componente for destruído durante uma chamada HTTP THEN system SHALL cancelar a subscription (takeUntilDestroyed)

---

## Arquitetura de Componentes (Preview)

```
src/app/
├── app.component.ts              # Shell: header + router-outlet
├── app.routes.ts                 # Rotas standalone
├── store/
│   ├── processos.actions.ts      # Actions: load, loadSuccess, loadFailure, create, update, delete
│   ├── processos.reducer.ts      # Reducer: estado da lista, loading, error
│   ├── processos.effects.ts      # Effects: chamadas HTTP via ProcessosService
│   └── processos.selectors.ts    # Selectors: processosList, loading, error
├── services/
│   └── processos.service.ts      # HTTP wrapper (GET, POST, PUT, DELETE)
├── pages/
│   └── dashboard/
│       ├── dashboard.component.ts    # Smart component: injeta Store, dispara actions
│       ├── dashboard.component.html  # Template: mat-table + botão "Novo"
│       └── dashboard.component.scss
├── components/
│   └── processo-form/
│       ├── processo-form.component.ts    # Dumb component: Reactive Form + Signals
│       ├── processo-form.component.html  # Template: form fields + botão Salvar
│       └── processo-form.component.scss
└── models/
    └── processo.model.ts         # Interface Processo
```

---

## Requirement Traceability

| Requirement ID | Story                | Phase  | Status  |
| -------------- | -------------------- | ------ | ------- |
| FRONT-01       | P1: Dashboard/Table  | Spec   | Pending |
| FRONT-02       | P1: NgRx Store       | Spec   | Pending |
| FRONT-03       | P1: Loading/Empty/Error | Spec | Pending |
| FRONT-04       | P2: Criação Form     | Spec   | Pending |
| FRONT-05       | P2: Signals (saving) | Spec   | Pending |
| FRONT-06       | P3: Edição Form      | Spec   | Pending |
| FRONT-07       | P4: Exclusão Dialog  | Spec   | Pending |
| FRONT-08       | P1-P4: Memory Leaks  | Spec   | Pending |
| FRONT-09       | P1-P4: Jest Tests    | Spec   | Pending |

**Coverage:** 9 total, 0 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] App Angular compila sem erros (`ng serve` ou `ng build`)
- [ ] Tabela lista processos da API (ou mostra estado vazio)
- [ ] Criar, editar e excluir processos funciona via UI
- [ ] Formulário desabilita botão "Salvar" quando inválido ou salvando (Signals)
- [ ] Zero memory leaks: sem subscriptions órfãs ao navegar/destruir componentes
- [ ] `npm test` passa com Jest em ProcessosService + 1 componente
- [ ] Console do navegador limpo (sem erros não tratados)
- [ ] Layout usa Angular Material com tema consistente
