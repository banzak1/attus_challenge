# Relatório de Incidente — Erro 500 ao criar processos sob carga

## O que aconteceu

Durante testes com o frontend, notei que ao fazer múltiplas requisições POST em sequência rápida (ex: clicar rápido em "Salvar" ou simular dois usuários cadastrando ao mesmo tempo), algumas delas retornavam erro 500 com `SQLITE_BUSY: database is locked`.

As operações de leitura (GET) nunca foram afetadas, apenas escritas simultâneas.

## Logs do erro

Olhando os logs do Pino no terminal, o padrão era esse:

```
req-47: POST /api/processos
req-48: POST /api/processos  (1ms depois)
req-47: SQLITE_BUSY: database is locked → 500
req-48: SQLITE_BUSY: database is locked → 500
```

Duas requisições chegando quase juntas, ambas tentando escrever, e ambas falhando porque o SQLite só permite um escritor por vez.

## Por que aconteceu

São dois problemas diferentes que se sobrepõem:

**1. Falta de `busy_timeout` no SQLite**

O banco está configurado com WAL mode, que já ajuda bastante (leitores não bloqueiam escritor), mas não configurei o `busy_timeout`. Sem ele, quando uma escrita tenta começar enquanto outra está no meio, o SQLite devolve `SQLITE_BUSY` na hora — não espera. O `better-sqlite3` transforma isso em exceção, que cai no Fastify como 500.

A solução seria simples: adicionar `db.pragma('busy_timeout = 5000')` logo depois de abrir o banco. Com isso o SQLite segura a segunda requisição por até 5 segundos esperando o lock liberar.

**2. Race condition na verificação de duplicidade**

Olhando o código do POST:

```typescript
// routes/processos.ts
if (verificarNumeroProcessoDuplicado(input.numero_processo)) {  // SELECT
  return reply.status(409)...
}
const processo = criarProcesso({...});  // INSERT
```

O SELECT e o INSERT não estão na mesma transação. Se duas requisições passarem pelo SELECT ao mesmo tempo (ambas veem que o número não existe), as duas vão tentar INSERT. A segunda quebra na constraint UNIQUE do banco — e isso também gera um erro 500 genérico, quando deveria ser um 409.

A solução seria envolver a verificação e a inserção numa transação:

```typescript
const resultado = db.transaction(() => {
  const exists = db.prepare('SELECT count(*) FROM processos WHERE numero_processo = ?').get(numero);
  if (exists.count > 0) return { erro: '...' };
  const info = db.prepare('INSERT INTO processos ...').run(...);
  return db.prepare('SELECT * FROM processos WHERE id = ?').get(info.lastInsertRowid);
})();
```

## Impacto

- **Severidade:** Média — erro intermitente, só sob carga simultânea de escritas
- **Frequência:** Baixa em uso normal (um usuário), mas sobe rápido com 2+ usuários
- **Dados:** Sem perda ou corrupção — as requisições que falharam simplesmente não persistiram

## Recomendações

### Correção (sugestão de PR)

- [ ] Adicionar `db.pragma('busy_timeout = 5000')` em `database.ts`
- [ ] Substituir o check-then-insert do POST por uma transação atômica

### Prevenção

- [ ] Adicionar log WARN (não ERROR) quando `SQLITE_BUSY` ocorrer — não é anormal, o retry resolve
- [ ] Monitorar tempo médio de escrita no banco — se começar a subir, investigar antes de quebrar
- [ ] Se o número de usuários concorrentes crescer, considerar migrar para PostgreSQL (MVCC resolve isso nativamente)

---

> Essa análise foi feita inspecionando o código e os logs do Pino durante o desenvolvimento. Os dois problemas são comuns em aplicações SQLite com múltiplos escritores e têm soluções bem documentadas.
