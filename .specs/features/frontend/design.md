# Frontend — Design Arquitetural (Essencial)

## Árvore de Componentes

```
AppComponent (shell: header + <router-outlet>)
└── DashboardComponent (smart — conecta Store)
    ├── mat-table (processos$ | async)
    ├── botão "Novo Processo" → abre MatDialog
    └── por linha: botões Editar / Excluir
        ├── Editar → abre MatDialog (mesmo componente, modo edição)
        └── Excluir → abre MatDialog (confirmação)

ProcessoFormComponent (dumb — @Input() processo?; @Output() saved)
├── Reactive Form: numero_processo, titulo, descricao, status
├── Signal: isSaving, isFormValid
└── mat-dialog-actions: Salvar (desabilitado se inválido/salvando) | Cancelar
```

## Fluxo de Dados

```
┌────────────┐  dispatch(load)   ┌──────────┐  HTTP GET    ┌──────────┐
│ Dashboard  │ ────────────────→ │  Effect  │ ───────────→ │   API    │
│ (Smart)    │                   │          │              │ Fastify  │
└────┬───────┘                   └────┬─────┘              └──────────┘
     │                               │
     │  select(processosList)        │ dispatch(loadSuccess)
     │  via async pipe               │
     ▼                               ▼
┌──────────┐                   ┌──────────┐
│  Store   │ ←─── Reducer ──── │ Actions  │
└──────────┘                   └──────────┘
```

**NgRx (global):** lista de processos, estado de loading, erro  
**Signals (local):** estado do formulário (isSaving, isFormValid, isEditing)

## Rotas

| Path | Componente | Descrição |
|------|-----------|-----------|
| `/` | `DashboardComponent` | Tabela com todos os processos |

> Criação e edição usam `MatDialog`, não rotas separadas — mantém o fluxo simples e o usuário não perde o contexto da tabela.

## Contrato NgRx ↔ Signals

```
NgRx: "O que é verdade sobre os dados"
  → Store contém processos[], loading, error
  → Componente lê via selectors (async pipe = autounsubscribe)

Signals: "O que é verdade sobre a UI local"
  → isSaving: true enquanto o Effect processa create/update
  → isFormValid: derivado do estado do Reactive Form
  → isLoading: derivado de select(selectLoading)

Regra de ouro:
  - Dados que atravessam componentes → NgRx Store
  - Estado que só interessa ao formulário → Signal local
  - Nunca duplicar: o form NÃO tem sua própria cópia da lista de processos
```

## Memory Leak Prevention

```
Observable no template  → async pipe (auto unsubscribe)
Observable no .ts       → pipe(takeUntilDestroyed())
Store selectors         → async pipe (preferido) ou toSignal() com inject(DestroyRef)
```
