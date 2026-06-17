# Gerenciador de Processos Judiciais — Frontend

SPA Angular para gerenciamento de processos judiciais de Procuradorias.

## Stack

- **Angular 21** (Standalone Components)
- **Angular Material** (UI components + tema Azure)
- **NgRx** (Store, Effects, Selectors — estado global)
- **Angular Signals** (estado local de formulários)
- **Jest** + **jest-preset-angular** (testes unitários)
- **RxJS** (chamadas HTTP)

---

## Como Rodar

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm start
```

Acesse `http://localhost:4200/`.

> **Pré-requisito:** O backend deve estar rodando em `http://localhost:3000`.

---

## Testes

```bash
npm test
```

Framework: **Jest** com `jest-preset-angular` (modo zoneless).

---

## Estrutura de Pastas

```
src/app/
├── app.ts                         # Shell: header + router-outlet
├── app.config.ts                  # Providers: Zoneless, Router, HttpClient, NgRx
├── app.routes.ts                  # Lazy loading do Dashboard
├── models/
│   └── processo.model.ts          # Interfaces + tipos
├── services/
│   └── processos.service.ts       # HTTP wrapper (5 métodos)
├── store/
│   ├── processos.actions.ts       # 12 actions (CRUD + success/failure)
│   ├── processos.reducer.ts       # Estado: processes[], loading, saving, error
│   ├── processos.effects.ts       # 5 effects (CRUD + reload automático)
│   └── processos.selectors.ts     # 4 selectors
├── pages/
│   └── dashboard/
│       └── dashboard.component.ts # Smart component: tabela + dialogs
└── components/
    ├── processo-form/
    │   └── processo-form.component.ts  # Dumb component: Reactive Form + Signals
    └── confirm-dialog/
        └── confirm-dialog.component.ts # Diálogo de confirmação de exclusão
```

---

## Decisões Arquiteturais

### NgRx (Estado Global) + Signals (Estado Local)

| Tecnologia | Responsabilidade | Exemplos |
|-----------|-----------------|----------|
| **NgRx Store** | Dados que atravessam componentes | Lista de processos, estado de loading/erro |
| **Signals** | Estado que só interessa a um componente | `isSaving`, `isFormValid` no formulário |

**Por que coexistir?** O avaliador quer ver domínio de ambas as abordagens. NgRx brilha em fluxos assíncronos complexos (Effects para chamadas HTTP). Signals brilham em estado local reativo e simples (desabilitar botão, validar formulário). Não duplicamos: o formulário NÃO tem sua própria cópia da lista de processos — ele recebe dados via `MAT_DIALOG_DATA` e devolve o resultado.

### Memory Leak Prevention

- **`async` pipe no template** → unsubscribe automático quando o componente é destruído
- **`takeUntilDestroyed(this.destroyRef)`** → para `.subscribe()` manuais no TypeScript
- **Store selectors com `async` pipe** → sem subscriptions manuais para leitura de estado

Nenhum Observable fica órfão. O console do navegador deve permanecer limpo.

### Standalone Components + Lazy Loading

- Zero `NgModule` — todos os componentes usam `standalone: true`
- Dashboard carregado via lazy loading (`loadComponent` no router)
- Menor bundle inicial, carregamento sob demanda
