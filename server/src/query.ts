/**
 * Tradução das requisições do cliente (API estilo supabase-js/PostgREST)
 * para SQL parametrizado. Todo identificador é validado contra o schema
 * carregado do banco; todo valor vai como parâmetro ($n).
 */
import pg from 'pg';
import { getSchema, isJsonType, type TableInfo, type ForeignKey } from './schema.js';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: string | null,
    public hint?: string | null,
  ) {
    super(message);
  }
}

export type FilterOp =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'like' | 'ilike' | 'is' | 'in' | 'cs' | 'cd' | 'ov';

/** Filtro vindo do cliente: valor JS (eq, in, contains...) ou expressão PostgREST (or, filter). */
export type FilterSpec =
  | { type: 'op'; column: string; op: FilterOp; value: unknown; negate?: boolean }
  | { type: 'raw'; column: string; op: string; value: string; negate?: boolean }
  | { type: 'or'; expr: string };

export interface QueryRequest {
  table: string;
  method: 'select' | 'insert' | 'update' | 'upsert' | 'delete';
  columns?: string;
  returning?: boolean;
  count?: 'exact' | 'planned' | 'estimated' | null;
  head?: boolean;
  filters?: FilterSpec[];
  order?: { column: string; ascending?: boolean; nullsFirst?: boolean }[];
  limit?: number;
  offset?: number;
  single?: 'single' | 'maybe' | null;
  values?: Record<string, unknown> | Record<string, unknown>[];
  onConflict?: string;
  ignoreDuplicates?: boolean;
}

export interface QueryResult {
  data: unknown;
  count: number | null;
  status: number;
}

// ---------------------------------------------------------------------------
// Utilitários

const quoteIdent = (name: string) => `"${name.replace(/"/g, '""')}"`;

class Params {
  values: unknown[] = [];
  add(value: unknown): string {
    this.values.push(value);
    return `$${this.values.length}`;
  }
}

function requireTable(tables: Map<string, TableInfo>, name: string): TableInfo {
  const table = tables.get(name);
  if (!table) {
    throw new ApiError(404, `relation "public.${name}" does not exist`, '42P01');
  }
  return table;
}

function requireColumn(table: TableInfo, column: string): string {
  if (!table.columns.has(column)) {
    throw new ApiError(400, `column ${table.name}.${column} does not exist`, '42703');
  }
  return column;
}

/** Converte um valor JS para o formato que o node-pg deve mandar para a coluna. */
function bindValue(table: TableInfo, column: string, value: unknown): unknown {
  if (value === null || value === undefined) return null;
  const info = table.columns.get(column);
  if (info && !info.isArray && isJsonType(info.udt)) return JSON.stringify(value);
  if (Array.isArray(value) && info?.isArray) return value;
  if (typeof value === 'object' && !(value instanceof Date)) return JSON.stringify(value);
  return value;
}

/** Divide por vírgulas de nível superior, respeitando (), {} e aspas. */
function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inQuotes = false;
  let current = '';
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"' && input[i - 1] !== '\\') inQuotes = !inQuotes;
    if (!inQuotes) {
      if (ch === '(' || ch === '{') depth++;
      if (ch === ')' || ch === '}') depth--;
      if (ch === ',' && depth === 0) {
        parts.push(current);
        current = '';
        continue;
      }
    }
    current += ch;
  }
  if (current.length) parts.push(current);
  return parts;
}

const unquote = (v: string) => (v.startsWith('"') && v.endsWith('"') ? v.slice(1, -1).replace(/\\"/g, '"') : v);

// ---------------------------------------------------------------------------
// Filtros

const SQL_OPS: Record<string, string> = {
  eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=',
  like: 'LIKE', ilike: 'ILIKE', cs: '@>', cd: '<@', ov: '&&',
};

function buildOpCondition(
  table: TableInfo, alias: string, column: string, op: string, value: unknown, fromString: boolean, params: Params,
): string {
  requireColumn(table, column);
  const col = `${alias}.${quoteIdent(column)}`;

  if (op === 'is') {
    const v = String(value).toLowerCase();
    if (value === null || v === 'null') return `${col} IS NULL`;
    if (v === 'true') return `${col} IS TRUE`;
    if (v === 'false') return `${col} IS FALSE`;
    if (v === 'unknown') return `${col} IS UNKNOWN`;
    throw new ApiError(400, `invalid value for "is": ${String(value)}`, 'PGRST100');
  }

  if (op === 'in') {
    let list: unknown[];
    if (fromString) {
      const inner = String(value).replace(/^\(/, '').replace(/\)$/, '');
      list = inner === '' ? [] : splitTopLevel(inner).map(unquote);
    } else {
      list = Array.isArray(value) ? value : [value];
    }
    return `${col} = ANY(${params.add(list.map((v) => bindValue(table, column, v)))})`;
  }

  const sqlOp = SQL_OPS[op];
  if (!sqlOp) throw new ApiError(400, `unsupported operator "${op}"`, 'PGRST100');

  let bound: unknown;
  if (fromString) {
    bound = op === 'like' || op === 'ilike' ? String(value).replace(/\*/g, '%') : unquote(String(value));
    // Arrays em notação PostgREST: cs.(a,b) -> {a,b}
    if ((op === 'cs' || op === 'cd' || op === 'ov') && /^\(.*\)$/.test(String(bound))) {
      bound = `{${String(bound).slice(1, -1)}}`;
    }
  } else {
    bound = bindValue(table, column, value);
  }
  return `${col} ${sqlOp} ${params.add(bound)}`;
}

/** Interpreta a sintaxe de filtros do PostgREST: "a.eq.1,and(b.gt.2,c.is.null)". */
function buildLogicExpr(table: TableInfo, alias: string, expr: string, joiner: 'AND' | 'OR', params: Params): string {
  const conditions = splitTopLevel(expr).map((term) => {
    term = term.trim();
    let negate = false;
    if (term.startsWith('not.')) {
      negate = true;
      term = term.slice(4);
    }
    const group = term.match(/^(and|or)\((.*)\)$/s);
    let sql: string;
    if (group) {
      sql = buildLogicExpr(table, alias, group[2], group[1].toUpperCase() as 'AND' | 'OR', params);
    } else {
      const m = term.match(/^([^.]+)\.(not\.)?([a-z]+)\.(.*)$/s);
      if (!m) throw new ApiError(400, `failed to parse filter (${term})`, 'PGRST100');
      sql = buildOpCondition(table, alias, m[1], m[3], m[4], true, params);
      if (m[2]) sql = `NOT (${sql})`;
    }
    return negate ? `NOT (${sql})` : sql;
  });
  return `(${conditions.join(` ${joiner} `)})`;
}

function buildWhere(table: TableInfo, alias: string, filters: FilterSpec[] | undefined, params: Params): string {
  if (!filters?.length) return '';
  const parts = filters.map((f) => {
    if (f.type === 'or') return buildLogicExpr(table, alias, f.expr, 'OR', params);
    const sql = buildOpCondition(table, alias, f.column, f.op, f.value, f.type === 'raw', params);
    return f.negate ? `NOT (${sql})` : sql;
  });
  return ` WHERE ${parts.join(' AND ')}`;
}

// ---------------------------------------------------------------------------
// Lista de colunas (select) com recursos embutidos: "*, areas!fk(*)"

type SelectItem =
  | { kind: 'star' }
  | { kind: 'column'; name: string; alias?: string }
  | { kind: 'embed'; relation: string; alias?: string; hint?: string; items: SelectItem[] };

function parseSelect(input: string | undefined): SelectItem[] {
  const clean = (input ?? '*').replace(/\s+(?=(?:[^"]*"[^"]*")*[^"]*$)/g, '');
  if (clean === '') return [{ kind: 'star' }];
  return splitTopLevel(clean).map((part): SelectItem => {
    if (part === '*') return { kind: 'star' };
    const embed = part.match(/^(?:([\w]+):)?([\w]+)(?:!([\w]+))?\((.*)\)$/s);
    if (embed) {
      const hint = embed[3] === 'inner' || embed[3] === 'left' ? undefined : embed[3];
      return { kind: 'embed', alias: embed[1], relation: embed[2], hint, items: parseSelect(embed[4]) };
    }
    const col = part.match(/^(?:([\w]+):)?([\w]+)(?:::[\w]+)?$/);
    if (!col) throw new ApiError(400, `failed to parse select parameter (${part})`, 'PGRST100');
    return { kind: 'column', alias: col[1], name: col[2] };
  });
}

function resolveEmbed(fks: ForeignKey[], base: string, relation: string, hint?: string) {
  const matchesHint = (fk: ForeignKey) => !hint || fk.name === hint || (fk.columns.length === 1 && fk.columns[0] === hint);
  const manyToOne = fks.filter((fk) => fk.table === base && fk.refTable === relation && matchesHint(fk));
  const oneToMany = fks.filter((fk) => fk.table === relation && fk.refTable === base && matchesHint(fk));
  const candidates = [
    ...manyToOne.map((fk) => ({ fk, toOne: true })),
    ...oneToMany.map((fk) => ({ fk, toOne: false })),
  ];
  if (candidates.length === 0) {
    throw new ApiError(400, `Could not find a relationship between '${base}' and '${relation}' in the schema cache`, 'PGRST200');
  }
  if (candidates.length > 1) {
    throw new ApiError(300, `Could not embed because more than one relationship was found for '${base}' and '${relation}'`, 'PGRST201');
  }
  return candidates[0];
}

async function buildSelectList(table: TableInfo, alias: string, items: SelectItem[], depth: number): Promise<string> {
  const schema = await getSchema();
  const exprs: string[] = [];
  for (const item of items) {
    if (item.kind === 'star') {
      exprs.push(`${alias}.*`);
    } else if (item.kind === 'column') {
      requireColumn(table, item.name);
      exprs.push(`${alias}.${quoteIdent(item.name)} AS ${quoteIdent(item.alias ?? item.name)}`);
    } else {
      const relTable = requireTable(schema.tables, item.relation);
      const { fk, toOne } = resolveEmbed(schema.foreignKeys, table.name, relTable.name, item.hint);
      const relAlias = `t${depth + 1}`;
      const inner = await buildSelectList(relTable, relAlias, item.items, depth + 1);
      const join = toOne
        ? fk.columns.map((c, i) => `${relAlias}.${quoteIdent(fk.refColumns[i])} = ${alias}.${quoteIdent(c)}`)
        : fk.columns.map((c, i) => `${relAlias}.${quoteIdent(c)} = ${alias}.${quoteIdent(fk.refColumns[i])}`);
      const from = `SELECT ${inner} FROM public.${quoteIdent(relTable.name)} ${relAlias} WHERE ${join.join(' AND ')}`;
      const sub = toOne
        ? `(SELECT row_to_json(e) FROM (${from} LIMIT 1) e)`
        : `(SELECT coalesce(json_agg(e), '[]'::json) FROM (${from}) e)`;
      exprs.push(`${sub} AS ${quoteIdent(item.alias ?? item.relation)}`);
    }
  }
  return exprs.join(', ');
}

function buildOrder(table: TableInfo, alias: string, order: QueryRequest['order']): string {
  if (!order?.length) return '';
  const parts = order.map((o) => {
    requireColumn(table, o.column);
    let sql = `${alias}.${quoteIdent(o.column)} ${o.ascending === false ? 'DESC' : 'ASC'}`;
    if (o.nullsFirst === true) sql += ' NULLS FIRST';
    if (o.nullsFirst === false) sql += ' NULLS LAST';
    return sql;
  });
  return ` ORDER BY ${parts.join(', ')}`;
}

function buildLimit(req: QueryRequest, params: Params): string {
  let sql = '';
  if (typeof req.limit === 'number') sql += ` LIMIT ${params.add(req.limit)}`;
  if (typeof req.offset === 'number') sql += ` OFFSET ${params.add(req.offset)}`;
  return sql;
}

// ---------------------------------------------------------------------------
// Execução

function applySingle(req: QueryRequest, rows: unknown[]): unknown {
  if (!req.single) return rows;
  if (rows.length === 1) return rows[0];
  if (req.single === 'maybe' && rows.length === 0) return null;
  throw new ApiError(
    406,
    'JSON object requested, multiple (or no) rows returned',
    'PGRST116',
    `The result contains ${rows.length} rows`,
  );
}

async function runSelect(client: pg.PoolClient, table: TableInfo, req: QueryRequest): Promise<QueryResult> {
  const params = new Params();
  const where = buildWhere(table, 't0', req.filters, params);
  let count: number | null = null;

  if (req.count) {
    const countParams = new Params();
    const countWhere = buildWhere(table, 't0', req.filters, countParams);
    const res = await client.query(
      `SELECT count(*)::int AS n FROM public.${quoteIdent(table.name)} t0${countWhere}`,
      countParams.values,
    );
    count = res.rows[0].n;
  }
  if (req.head) return { data: null, count, status: 200 };

  const list = await buildSelectList(table, 't0', parseSelect(req.columns), 0);
  const inner = `SELECT ${list} FROM public.${quoteIdent(table.name)} t0${where}${buildOrder(table, 't0', req.order)}${buildLimit(req, params)}`;
  const res = await client.query(`SELECT coalesce(json_agg(r), '[]'::json) AS data FROM (${inner}) r`, params.values);
  return { data: applySingle(req, res.rows[0].data), count, status: 200 };
}

function rowsOf(values: QueryRequest['values']): Record<string, unknown>[] {
  if (!values) throw new ApiError(400, 'missing values', 'PGRST102');
  return Array.isArray(values) ? values : [values];
}

async function runMutation(client: pg.PoolClient, table: TableInfo, req: QueryRequest): Promise<QueryResult> {
  const params = new Params();
  const target = `public.${quoteIdent(table.name)}`;
  let statement: string;

  if (req.method === 'insert' || req.method === 'upsert') {
    const rows = rowsOf(req.values);
    if (rows.length === 0) return { data: req.returning ? [] : null, count: null, status: 201 };
    const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))].map((c) => requireColumn(table, c));
    const tuples = rows.map(
      (row) => `(${columns.map((c) => (c in row ? params.add(bindValue(table, c, row[c])) : 'DEFAULT')).join(', ')})`,
    );
    statement = `INSERT INTO ${target} AS t0 (${columns.map(quoteIdent).join(', ')}) VALUES ${tuples.join(', ')}`;

    if (req.method === 'upsert') {
      const conflict = req.onConflict
        ? req.onConflict.split(',').map((c) => requireColumn(table, c.trim()))
        : table.primaryKey;
      if (!conflict.length) throw new ApiError(400, `table ${table.name} has no primary key for upsert`, 'PGRST100');
      const updatable = columns.filter((c) => !conflict.includes(c));
      statement +=
        req.ignoreDuplicates || updatable.length === 0
          ? ` ON CONFLICT (${conflict.map(quoteIdent).join(', ')}) DO NOTHING`
          : ` ON CONFLICT (${conflict.map(quoteIdent).join(', ')}) DO UPDATE SET ${updatable
              .map((c) => `${quoteIdent(c)} = EXCLUDED.${quoteIdent(c)}`)
              .join(', ')}`;
    }
  } else if (req.method === 'update') {
    const values = req.values as Record<string, unknown>;
    if (!values || Array.isArray(values)) throw new ApiError(400, 'update expects an object', 'PGRST102');
    const sets = Object.keys(values).map(
      (c) => `${quoteIdent(requireColumn(table, c))} = ${params.add(bindValue(table, c, values[c]))}`,
    );
    if (!sets.length) return { data: req.returning ? [] : null, count: null, status: 204 };
    statement = `UPDATE ${target} AS t0 SET ${sets.join(', ')}${buildWhere(table, 't0', req.filters, params)}`;
  } else {
    statement = `DELETE FROM ${target} AS t0${buildWhere(table, 't0', req.filters, params)}`;
  }

  const status = req.method === 'insert' || req.method === 'upsert' ? 201 : 200;

  if (!req.returning) {
    const res = await client.query(statement, params.values);
    return { data: null, count: req.count ? res.rowCount : null, status: status === 201 ? 201 : 204 };
  }

  const list = await buildSelectList(table, 't0', parseSelect(req.columns), 0);
  const sql = `WITH m AS (${statement} RETURNING t0.*)
    SELECT coalesce(json_agg(r), '[]'::json) AS data, count(*)::int AS n
      FROM (SELECT ${list} FROM m t0${buildOrder(table, 't0', req.order)}) r`;
  const res = await client.query(sql, params.values);
  return {
    data: applySingle(req, res.rows[0].data),
    count: req.count ? res.rows[0].n : null,
    status,
  };
}

export async function executeQuery(client: pg.PoolClient, req: QueryRequest): Promise<QueryResult> {
  const schema = await getSchema();
  const table = requireTable(schema.tables, req.table);
  return req.method === 'select' ? runSelect(client, table, req) : runMutation(client, table, req);
}

// ---------------------------------------------------------------------------
// RPC

export async function executeRpc(client: pg.PoolClient, name: string, args: Record<string, unknown>): Promise<unknown> {
  const schema = await getSchema();
  const fn = schema.functions.get(name);
  if (!fn) throw new ApiError(404, `Could not find the function public.${name} in the schema cache`, 'PGRST202');

  const params = new Params();
  const named = Object.entries(args ?? {}).map(([key, value]) => {
    const idx = fn.argNames.indexOf(key);
    if (idx === -1) throw new ApiError(404, `function public.${name} has no argument "${key}"`, 'PGRST202');
    const type = fn.argTypes[idx];
    const bound = (type === 'json' || type === 'jsonb') && value !== null ? JSON.stringify(value) : value;
    return `${quoteIdent(key)} => ${params.add(bound)}::${type}`;
  });
  const call = `public.${quoteIdent(name)}(${named.join(', ')})`;

  if (fn.returnsSet) {
    const res = await client.query(`SELECT coalesce(json_agg(r), '[]'::json) AS data FROM ${call} r`, params.values);
    return res.rows[0].data;
  }
  if (fn.returnTypeType === 'c') {
    const res = await client.query(`SELECT row_to_json(r) AS data FROM ${call} r`, params.values);
    return res.rows[0]?.data ?? null;
  }
  if (fn.returnType === 'void') {
    await client.query(`SELECT ${call}`, params.values);
    return null;
  }
  const res = await client.query(`SELECT to_json(${call}) AS data`, params.values);
  return res.rows[0].data;
}

/** Converte erros do Postgres para o formato de erro do PostgREST. */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  const e = err as pg.DatabaseError;
  if (e && typeof e.code === 'string') {
    const status =
      e.code === '42501' ? 403 :
      e.code === '23505' || e.code === '23503' ? 409 :
      e.code.startsWith('22') || e.code.startsWith('23') ? 400 :
      e.code === 'P0001' ? 400 : 500;
    return new ApiError(status, e.message, e.code, e.detail ?? null, e.hint ?? null);
  }
  return new ApiError(500, (err as Error)?.message ?? 'Internal error');
}
