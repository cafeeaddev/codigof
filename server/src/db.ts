import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({ connectionString: config.databaseUrl(), max: 20 });

export type DbRole = 'anon' | 'authenticated' | 'service_role';

export interface Claims {
  sub?: string;
  email?: string;
  role: DbRole;
  [key: string]: unknown;
}

export const ANON_CLAIMS: Claims = { role: 'anon' };
export const SERVICE_CLAIMS: Claims = { role: 'service_role' };

/**
 * Executa `fn` numa transação com a role e as claims do JWT aplicadas,
 * do mesmo jeito que o PostgREST faz: as policies de RLS e auth.uid()
 * enxergam exatamente o usuário da requisição.
 */
export async function withClaims<T>(claims: Claims, fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('request.jwt.claims', $1, true), set_config('role', $2, true)`, [
      JSON.stringify(claims),
      claims.role,
    ]);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
