/**
 * Substitui o Supabase Auth (GoTrue). As senhas em auth.users são hashes
 * bcrypt, o mesmo formato do Supabase, então usuários importados continuam
 * entrando com a senha que já tinham.
 */
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request } from 'express';
import pg from 'pg';
import { config } from './config.js';
import { ANON_CLAIMS, pool, type Claims } from './db.js';
import { ApiError } from './query.js';

export interface AuthUserRow {
  id: string;
  email: string;
  encrypted_password: string | null;
  raw_user_meta_data: Record<string, unknown> | null;
  raw_app_meta_data: Record<string, unknown> | null;
  email_confirmed_at: Date | null;
  last_sign_in_at: Date | null;
  created_at: Date;
  updated_at: Date;
  banned_until: Date | null;
}

/** Formato de usuário devolvido pelo supabase-js */
export function toUser(row: AuthUserRow) {
  return {
    id: row.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: row.email,
    email_confirmed_at: row.email_confirmed_at,
    confirmed_at: row.email_confirmed_at,
    last_sign_in_at: row.last_sign_in_at,
    app_metadata: row.raw_app_meta_data ?? {},
    user_metadata: row.raw_user_meta_data ?? {},
    created_at: row.created_at,
    updated_at: row.updated_at,
    identities: [],
    is_anonymous: false,
  };
}

const USER_COLUMNS = `id, email, encrypted_password, raw_user_meta_data, raw_app_meta_data,
  email_confirmed_at, last_sign_in_at, created_at, updated_at, banned_until`;

type Queryable = pg.Pool | pg.PoolClient;

export async function findUserByEmail(db: Queryable, email: string): Promise<AuthUserRow | null> {
  const res = await db.query<AuthUserRow>(
    `SELECT ${USER_COLUMNS} FROM auth.users WHERE lower(email) = lower($1) AND deleted_at IS NULL`,
    [email],
  );
  return res.rows[0] ?? null;
}

export async function findUserById(db: Queryable, id: string): Promise<AuthUserRow | null> {
  const res = await db.query<AuthUserRow>(
    `SELECT ${USER_COLUMNS} FROM auth.users WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  return res.rows[0] ?? null;
}

export async function createUser(
  db: Queryable,
  email: string,
  password: string,
  userMetadata: Record<string, unknown>,
): Promise<AuthUserRow> {
  // Dispara o trigger on_auth_user_created das migrations, como no Supabase
  const res = await db.query<AuthUserRow>(
    `INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data, email_confirmed_at)
     VALUES ($1, $2, $3, now()) RETURNING ${USER_COLUMNS}`,
    [email, await bcrypt.hash(password, 10), JSON.stringify(userMetadata)],
  );
  return res.rows[0];
}

export async function setPassword(db: Queryable, userId: string, password: string): Promise<void> {
  await db.query(`UPDATE auth.users SET encrypted_password = $2, updated_at = now() WHERE id = $1`, [
    userId,
    await bcrypt.hash(password, 10),
  ]);
}

export async function verifyPassword(user: AuthUserRow, password: string): Promise<boolean> {
  if (!user.encrypted_password) return false;
  // Supabase grava $2a$/$2b$; bcryptjs aceita ambos
  return bcrypt.compare(password, user.encrypted_password);
}

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

/** Emite access token (JWT) + refresh token, no formato de sessão do supabase-js. */
export async function issueSession(db: Queryable, user: AuthUserRow) {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + config.accessTokenTtlSeconds;
  const sessionId = crypto.randomUUID();
  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: 'authenticated',
      aud: 'authenticated',
      session_id: sessionId,
      app_metadata: user.raw_app_meta_data ?? {},
      user_metadata: user.raw_user_meta_data ?? {},
      iat: now,
      exp: expiresAt,
    },
    config.jwtSecret(),
    { algorithm: 'HS256' },
  );

  const refreshToken = crypto.randomBytes(32).toString('base64url');
  await db.query(
    `INSERT INTO auth.refresh_tokens (token_hash, user_id, expires_at)
     VALUES ($1, $2, now() + make_interval(days => $3))`,
    [hashToken(refreshToken), user.id, config.refreshTokenTtlDays],
  );
  await db.query(`UPDATE auth.users SET last_sign_in_at = now() WHERE id = $1`, [user.id]);

  return {
    access_token: accessToken,
    token_type: 'bearer',
    expires_in: config.accessTokenTtlSeconds,
    expires_at: expiresAt,
    refresh_token: refreshToken,
    user: toUser(user),
  };
}

export async function signInWithPassword(email: string, password: string) {
  const user = await findUserByEmail(pool, email);
  if (!user || !(await verifyPassword(user, password))) {
    throw new ApiError(400, 'Invalid login credentials', 'invalid_credentials');
  }
  if (user.banned_until && user.banned_until > new Date()) {
    throw new ApiError(400, 'User is banned', 'user_banned');
  }
  return issueSession(pool, user);
}

/** Troca o refresh token por uma sessão nova (rotação: o antigo é revogado). */
export async function refreshSession(refreshToken: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await client.query<{ user_id: string }>(
      `UPDATE auth.refresh_tokens SET revoked = true
        WHERE token_hash = $1 AND NOT revoked AND expires_at > now()
        RETURNING user_id`,
      [hashToken(refreshToken)],
    );
    const userId = res.rows[0]?.user_id;
    const user = userId ? await findUserById(client, userId) : null;
    if (!user) throw new ApiError(400, 'Invalid Refresh Token: Refresh Token Not Found', 'refresh_token_not_found');
    const session = await issueSession(client, user);
    await client.query('COMMIT');
    return session;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function revokeRefreshTokens(userId: string): Promise<void> {
  await pool.query(`UPDATE auth.refresh_tokens SET revoked = true WHERE user_id = $1 AND NOT revoked`, [userId]);
}

export function verifyAccessToken(token: string): Claims {
  try {
    const payload = jwt.verify(token, config.jwtSecret(), { algorithms: ['HS256'] }) as Claims;
    return { ...payload, role: 'authenticated' };
  } catch {
    throw new ApiError(401, 'invalid JWT: unable to parse or verify signature', 'PGRST301');
  }
}

/** Claims da requisição: usuário autenticado pelo Bearer token, ou anon. */
export function claimsFromRequest(req: Request): Claims {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return ANON_CLAIMS;
  return verifyAccessToken(header.slice('Bearer '.length));
}

export function requireUser(req: Request): Claims & { sub: string } {
  const claims = claimsFromRequest(req);
  if (!claims.sub) throw new ApiError(401, 'Unauthorized', 'not_authenticated');
  return claims as Claims & { sub: string };
}

export async function isAdmin(userId: string): Promise<boolean> {
  const res = await pool.query(`SELECT 1 FROM public.user_roles WHERE user_id = $1 AND role = 'admin' LIMIT 1`, [userId]);
  return (res.rowCount ?? 0) > 0;
}
