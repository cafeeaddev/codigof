import pg from 'pg';
import { withClaims, SERVICE_CLAIMS } from './db.js';

export interface ColumnInfo {
  name: string;
  /** Tipo base (ex.: jsonb, _uuid para arrays, timestamptz) */
  udt: string;
  isArray: boolean;
}

export interface TableInfo {
  name: string;
  columns: Map<string, ColumnInfo>;
  primaryKey: string[];
}

export interface ForeignKey {
  name: string;
  table: string;
  columns: string[];
  refTable: string;
  refColumns: string[];
}

export interface FunctionInfo {
  name: string;
  argNames: string[];
  argTypes: string[];
  returnsSet: boolean;
  /** 'c' composto, 'b' base, 'p' pseudo (void/record), etc. */
  returnTypeType: string;
  returnType: string;
}

interface SchemaCache {
  tables: Map<string, TableInfo>;
  foreignKeys: ForeignKey[];
  functions: Map<string, FunctionInfo>;
}

let cache: SchemaCache | null = null;

export async function loadSchema(): Promise<SchemaCache> {
  // information_schema só mostra o que a role atual enxerga, por isso service_role
  cache = await withClaims(SERVICE_CLAIMS, readSchema);
  return cache;
}

async function readSchema(pool: pg.PoolClient): Promise<SchemaCache> {
  const columns = await pool.query<{ table_name: string; column_name: string; udt_name: string; data_type: string }>(`
    SELECT table_name, column_name, udt_name, data_type
      FROM information_schema.columns
     WHERE table_schema = 'public'
     ORDER BY table_name, ordinal_position`);

  const pks = await pool.query<{ table_name: string; cols: string[] }>(`
    SELECT c.relname AS table_name, array_agg(a.attname ORDER BY k.ord)::text[] AS cols
      FROM pg_constraint con
      JOIN pg_class c ON c.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      CROSS JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord)
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = k.attnum
     WHERE n.nspname = 'public' AND con.contype = 'p'
     GROUP BY c.relname`);

  const fks = await pool.query<ForeignKey & { ref_table: string; ref_columns: string[] }>(`
    SELECT con.conname AS name,
           c.relname AS table,
           rc.relname AS ref_table,
           array(SELECT a.attname FROM unnest(con.conkey) WITH ORDINALITY k(n, o)
                   JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = k.n ORDER BY k.o)::text[] AS columns,
           array(SELECT a.attname FROM unnest(con.confkey) WITH ORDINALITY k(n, o)
                   JOIN pg_attribute a ON a.attrelid = con.confrelid AND a.attnum = k.n ORDER BY k.o)::text[] AS ref_columns
      FROM pg_constraint con
      JOIN pg_class c ON c.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_class rc ON rc.oid = con.confrelid
      JOIN pg_namespace rn ON rn.oid = rc.relnamespace
     WHERE con.contype = 'f' AND n.nspname = 'public' AND rn.nspname = 'public'`);

  const fns = await pool.query<{
    name: string; arg_names: string[] | null; arg_types: string[]; returns_set: boolean; typtype: string; rettype: string;
  }>(`
    SELECT p.proname AS name,
           p.proargnames AS arg_names,
           array(SELECT format_type(t, NULL) FROM unnest(p.proargtypes) t) AS arg_types,
           p.proretset AS returns_set,
           t.typtype,
           format_type(p.prorettype, NULL) AS rettype
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      JOIN pg_type t ON t.oid = p.prorettype
     WHERE n.nspname = 'public' AND p.prokind = 'f'`);

  const tables = new Map<string, TableInfo>();
  for (const row of columns.rows) {
    let table = tables.get(row.table_name);
    if (!table) {
      table = { name: row.table_name, columns: new Map(), primaryKey: [] };
      tables.set(row.table_name, table);
    }
    const isArray = row.data_type === 'ARRAY';
    table.columns.set(row.column_name, {
      name: row.column_name,
      udt: isArray ? row.udt_name.replace(/^_/, '') : row.udt_name,
      isArray,
    });
  }
  for (const row of pks.rows) {
    const table = tables.get(row.table_name);
    if (table) table.primaryKey = row.cols;
  }

  const functions = new Map<string, FunctionInfo>();
  for (const row of fns.rows) {
    functions.set(row.name, {
      name: row.name,
      argNames: (row.arg_names ?? []).slice(0, row.arg_types.length),
      argTypes: row.arg_types,
      returnsSet: row.returns_set,
      returnTypeType: row.typtype,
      returnType: row.rettype,
    });
  }

  return {
    tables,
    foreignKeys: fks.rows.map((r) => ({
      name: r.name, table: r.table, columns: r.columns, refTable: r.ref_table, refColumns: r.ref_columns,
    })),
    functions,
  };
}

export async function getSchema(): Promise<SchemaCache> {
  return cache ?? loadSchema();
}

export function isJsonType(udt: string): boolean {
  return udt === 'json' || udt === 'jsonb';
}
