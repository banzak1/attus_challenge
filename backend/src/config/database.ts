import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

function getDbPath(): string {
  if (process.env.DB_PATH) {
    return process.env.DB_PATH;
  }
  return path.join(__dirname, '..', '..', 'database.db');
}

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = getDbPath();
    db = new Database(dbPath);

    // WAL mode não é compatível com bancos em memória
    if (dbPath !== ':memory:') {
      db.pragma('journal_mode = WAL');
    }
    db.pragma('foreign_keys = ON');

    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS processos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_processo TEXT NOT NULL UNIQUE,
      titulo TEXT NOT NULL,
      descricao TEXT,
      status TEXT NOT NULL DEFAULT 'EM_ANDAMENTO'
        CHECK(status IN ('EM_ANDAMENTO', 'SUSPENSO', 'CONCLUIDO')),
      data_criacao TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
  }
}
