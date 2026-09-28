import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import express, { type NextFunction, type Request, type Response } from 'express';
import { config } from './config.js';
import { pool, withClaims } from './db.js';
import { loadSchema } from './schema.js';
import { ApiError, executeQuery, executeRpc, toApiError, type QueryRequest } from './query.js';
import {
  claimsFromRequest, findUserById, refreshSession, requireUser, revokeRefreshTokens, signInWithPassword, toUser,
} from './auth.js';
import { functionsRouter } from './functions.js';
import { attachRealtime } from './realtime.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));

// --- Auth --------------------------------------------------------------------

app.post('/api/auth/token', async (req, res) => {
  const grantType = req.query.grant_type;
  if (grantType === 'password') {
    res.json(await signInWithPassword(String(req.body?.email ?? ''), String(req.body?.password ?? '')));
  } else if (grantType === 'refresh_token') {
    res.json(await refreshSession(String(req.body?.refresh_token ?? '')));
  } else {
    throw new ApiError(400, 'unsupported grant_type', 'unsupported_grant_type');
  }
});

app.get('/api/auth/user', async (req, res) => {
  const claims = requireUser(req);
  const user = await findUserById(pool, claims.sub);
  if (!user) throw new ApiError(401, 'User not found', 'user_not_found');
  res.json(toUser(user));
});

app.post('/api/auth/logout', async (req, res) => {
  const claims = claimsFromRequest(req);
  if (claims.sub) await revokeRefreshTokens(claims.sub);
  res.status(204).end();
});

// --- Dados (equivalente ao PostgREST) ------------------------------------------

app.post('/api/rest', async (req, res) => {
  const body = req.body as QueryRequest;
  const result = await withClaims(claimsFromRequest(req), (client) => executeQuery(client, body));
  res.status(result.status).json({ data: result.data, count: result.count });
});

app.post('/api/rpc/:fn', async (req, res) => {
  const data = await withClaims(claimsFromRequest(req), (client) => executeRpc(client, String(req.params.fn), req.body ?? {}));
  res.json({ data });
});

app.post('/api/admin/reload-schema', async (req, res) => {
  requireUser(req);
  await loadSchema();
  res.status(204).end();
});

// Verificação de saúde (monitoramento): responde 200 se a API e o banco estão ok
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'erro', message: 'Banco de dados indisponível' });
  }
});

app.use('/api/functions', functionsRouter);

app.use('/api', (_req, _res, next) => next(new ApiError(404, 'Not found')));

// --- Frontend compilado (npm run build), para rodar tudo num processo só ------

const distDir = path.resolve(import.meta.dirname, '../../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

// --- Erros ---------------------------------------------------------------------

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const e = toApiError(err);
  if (e.status >= 500) console.error('[api]', err);
  res.status(e.status).json({ error: e.message, message: e.message, code: e.code, details: e.details, hint: e.hint });
});

// --- Start ---------------------------------------------------------------------

await loadSchema();
const server = http.createServer(app);
attachRealtime(server);
server.listen(config.port, () => {
  console.log(`[server] API ouvindo em http://localhost:${config.port}`);
});
