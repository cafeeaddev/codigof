import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(import.meta.dirname, '../.env'), quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não definida (veja server/.env.example)`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  // Conexão usada pelo servidor em runtime (role app_server, sem superuser)
  databaseUrl: () => required('DATABASE_URL'),
  // Conexão de administrador, usada só pelos scripts de migração/importação
  adminDatabaseUrl: () => required('ADMIN_DATABASE_URL'),
  // Banco de produção (Supabase), usado só pelo script de importação
  sourceDatabaseUrl: () => required('SOURCE_DATABASE_URL'),
  /**
   * Mesma URL para o driver `pg`, com sslmode na semântica do libpq (igual ao pg_dump):
   * o `pg` trata `require` como `verify-full` e recusa a CA própria do pooler do Supabase.
   */
  sourceDatabaseUrlForNode: () => {
    const url = new URL(required('SOURCE_DATABASE_URL'));
    url.searchParams.set('uselibpqcompat', 'true');
    return url.toString();
  },
  jwtSecret: () => required('JWT_SECRET'),
  accessTokenTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 3600),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30),
  openaiApiKey: process.env.OPENAI_API_KEY,
  usersApiToken: process.env.USERS_API_TOKEN,
};
