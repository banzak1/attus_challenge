# Gerenciador de Processos Judiciais

Sistema full-stack para gerenciamento de processos judiciais em Procuradorias.

## Estrutura

```
attus_challenge/
├── backend/     # API RESTful — Fastify + SQLite + Swagger
└── frontend/    # SPA — Angular 21 + Material + NgRx
```

---

## Setup Rápido (2 terminais)

### 1. Backend (API)

```bash
cd backend
npm install
npm start
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

### 2. Frontend (UI)

```bash
cd frontend
npm install
npm start
```

- App: `http://localhost:4200`

---

## Testes

```bash
# Backend (Vitest)
cd backend && npm test

# Frontend (Jest)
cd frontend && npm test
```

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| API | Fastify + TypeScript |
| Banco | SQLite (`better-sqlite3`) |
| Documentação | Swagger auto-gerado |
| Logs | Pino |
| Frontend | Angular 21 (Standalone) |
| UI | Angular Material |
| Estado Global | NgRx (Store + Effects) |
| Estado Local | Angular Signals |
| Testes Backend | Vitest |
| Testes Frontend | Jest + jest-preset-angular |
