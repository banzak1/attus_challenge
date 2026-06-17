# Gerenciador de Processos Judiciais — Backend

API RESTful para gerenciamento de processos judiciais de Procuradorias.

## Stack

- **Node.js** + **TypeScript**
- **Fastify** (alta performance, validação nativa)
- **SQLite** via `better-sqlite3` (persistência local, zero containers)
- **Swagger** auto-gerado com `@fastify/swagger` + `@fastify/swagger-ui`
- **Pino** para logs automáticos de requisições

---

## Como Rodar

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor (modo desenvolvimento com hot reload)
npm run dev

# 3. Ou iniciar sem hot reload
npm start
```

O servidor sobe em `http://localhost:3000`.

---

## Swagger

Documentação interativa da API disponível em:

👉 **http://localhost:3000/docs**

Todos os endpoints, schemas de request/response e validações estão documentados e podem ser testados diretamente pela interface Swagger.

---

## Endpoints

| Método  | Rota                     | Descrição                    |
| ------- | ------------------------ | ---------------------------- |
| `GET`   | `/api/processos`         | Listar todos os processos    |
| `GET`   | `/api/processos/:id`     | Buscar processo por ID       |
| `POST`  | `/api/processos`         | Criar novo processo          |
| `PUT`   | `/api/processos/:id`     | Atualizar processo existente |
| `DELETE`| `/api/processos/:id`     | Remover processo             |
| `GET`   | `/api/health`            | Health check da API          |

---

## Testes

```bash
npm test
```

---

## Estrutura de Pastas

```
backend/
├── src/
│   ├── server.ts              # Ponto de entrada: Fastify + plugins
│   ├── config/
│   │   └── database.ts        # Inicialização do SQLite + schema DDL
│   ├── routes/
│   │   └── processos.ts       # Registro das 5 rotas com validação
│   ├── controllers/
│   │   └── processos.ts       # Operações CRUD no banco
│   ├── schemas/
│   │   └── processos.ts       # Tipos TypeScript + JSON Schemas Fastify
│   └── __tests__/
│       └── server.test.ts     # Testes da API
├── package.json
└── tsconfig.json
```
