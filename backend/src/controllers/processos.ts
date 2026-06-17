import { getDatabase } from '../config/database';
import type { Processo, CreateProcessoInput, UpdateProcessoInput } from '../schemas/processos';

export function listarProcessos(): Processo[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM processos ORDER BY data_criacao DESC');
  return stmt.all() as Processo[];
}

export function buscarProcessoPorId(id: number): Processo | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM processos WHERE id = ?');
  const result = stmt.get(id);
  return result ? (result as Processo) : null;
}

export function criarProcesso(input: CreateProcessoInput): Processo {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO processos (numero_processo, titulo, descricao, status)
    VALUES (@numero_processo, @titulo, @descricao, @status)
  `);

  const status = input.status ?? 'EM_ANDAMENTO';
  const descricao = input.descricao ?? null;

  const info = stmt.run({
    numero_processo: input.numero_processo.trim(),
    titulo: input.titulo.trim(),
    descricao,
    status,
  });

  return buscarProcessoPorId(Number(info.lastInsertRowid))!;
}

export function atualizarProcesso(id: number, input: UpdateProcessoInput): Processo | null {
  const db = getDatabase();

  // Constrói SET clause dinamicamente com base nos campos enviados
  const sets: string[] = [];
  const params: Record<string, unknown> = { id };

  if (input.titulo !== undefined) {
    sets.push('titulo = @titulo');
    params.titulo = input.titulo.trim();
  }
  if (input.descricao !== undefined) {
    sets.push('descricao = @descricao');
    params.descricao = input.descricao;
  }
  if (input.status !== undefined) {
    sets.push('status = @status');
    params.status = input.status;
  }

  if (sets.length === 0) {
    return buscarProcessoPorId(id);
  }

  const stmt = db.prepare(`UPDATE processos SET ${sets.join(', ')} WHERE id = @id`);
  stmt.run(params);

  return buscarProcessoPorId(id);
}

export function deletarProcesso(id: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM processos WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}

export function verificarNumeroProcessoDuplicado(numeroProcesso: string, excluirId?: number): boolean {
  const db = getDatabase();
  let sql = 'SELECT COUNT(*) as count FROM processos WHERE numero_processo = ?';
  const params: (string | number)[] = [numeroProcesso.trim()];

  if (excluirId !== undefined) {
    sql += ' AND id != ?';
    params.push(excluirId);
  }

  const stmt = db.prepare(sql);
  const result = stmt.get(...params) as { count: number };
  return result.count > 0;
}
