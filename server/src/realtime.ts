/**
 * Substitui o Supabase Realtime.
 *  - postgres_changes: triggers (server/sql/90_realtime.sql) fazem NOTIFY 'realtime';
 *    o servidor escuta e repassa a quem assinou, checando RLS do assinante.
 *  - broadcast: mensagens repassadas entre clientes do mesmo tópico.
 *
 * Protocolo (JSON sobre WebSocket em /api/realtime):
 *   cliente -> { type: 'auth', token } | { type: 'join', id, topic, changes, self }
 *            | { type: 'leave', id } | { type: 'broadcast', topic, event, payload }
 *   servidor -> { type: 'postgres_changes', id, index, payload }
 *            | { type: 'broadcast', id, event, payload } | { type: 'joined', id }
 * `id` identifica cada canal aberto no cliente (pode haver vários com o mesmo tópico).
 */
import type { Server } from 'node:http';
import pg from 'pg';
import { WebSocketServer, WebSocket } from 'ws';
import { config } from './config.js';
import { ANON_CLAIMS, SERVICE_CLAIMS, pool, withClaims, type Claims } from './db.js';
import { verifyAccessToken } from './auth.js';

interface ChangeSpec {
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  schema?: string;
  table?: string;
  filter?: string;
}

interface Subscription {
  topic: string;
  changes: ChangeSpec[];
  self: boolean;
}

interface Client {
  socket: WebSocket;
  claims: Claims;
  subs: Map<string, Subscription>;
}

interface ChangeEvent {
  schema: string;
  table: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  commit_timestamp: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
  truncated?: boolean;
}

const clients = new Set<Client>();

function send(client: Client, message: unknown) {
  if (client.socket.readyState === WebSocket.OPEN) client.socket.send(JSON.stringify(message));
}

// ---------------------------------------------------------------------------
// Filtro de postgres_changes: "coluna=op.valor"

function matchesFilter(filter: string | undefined, row: Record<string, unknown> | null): boolean {
  if (!filter) return true;
  if (!row) return false;
  const m = filter.match(/^([^=]+)=(eq|neq|lt|lte|gt|gte|in)\.(.*)$/s);
  if (!m) return false;
  const [, column, op, raw] = m;
  const value = row[column];
  const asString = value === null || value === undefined ? 'null' : String(value);
  switch (op) {
    case 'eq': return asString === raw;
    case 'neq': return asString !== raw;
    case 'in': return raw.replace(/^\(|\)$/g, '').split(',').map((v) => v.trim().replace(/^"|"$/g, '')).includes(asString);
    default: {
      const a = Number(value);
      const b = Number(raw);
      const [x, y] = Number.isNaN(a) || Number.isNaN(b) ? [asString, raw] : [a, b];
      return op === 'lt' ? x < y : op === 'lte' ? x <= y : op === 'gt' ? x > y : x >= y;
    }
  }
}

// ---------------------------------------------------------------------------
// RLS: tabelas com leitura liberada pulam a checagem por assinante

const openTableCache = new Map<string, { open: boolean; at: number }>();

async function isOpenForReading(table: string): Promise<boolean> {
  const cached = openTableCache.get(table);
  if (cached && Date.now() - cached.at < 60_000) return cached.open;
  const res = await pool.query<{ open: boolean }>(
    `SELECT NOT c.relrowsecurity OR EXISTS (
              SELECT 1 FROM pg_policies p
               WHERE p.schemaname = 'public' AND p.tablename = c.relname
                 AND p.cmd IN ('SELECT', 'ALL') AND p.permissive = 'PERMISSIVE'
                 AND p.qual = 'true'
                 AND p.roles && ARRAY['public', 'authenticated', 'anon']::name[]
            ) AS open
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = $1`,
    [table],
  );
  const open = res.rows[0]?.open ?? false;
  openTableCache.set(table, { open, at: Date.now() });
  return open;
}

async function canSee(claims: Claims, table: string, id: unknown): Promise<boolean> {
  if (id === undefined || id === null) return false;
  return withClaims(claims, async (c) => {
    const res = await c.query(`SELECT 1 FROM public."${table.replace(/"/g, '""')}" WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  });
}

async function hydrate(event: ChangeEvent): Promise<void> {
  // Payload grande demais para o NOTIFY: relê a linha completa
  if (!event.truncated || !event.record?.id) return;
  const row = await withClaims(SERVICE_CLAIMS, (c) =>
    c.query(`SELECT to_jsonb(t) AS r FROM public."${event.table.replace(/"/g, '""')}" t WHERE id = $1`, [event.record!.id]),
  );
  if (row.rows[0]) event.record = row.rows[0].r;
}

async function dispatchChange(event: ChangeEvent) {
  await hydrate(event);
  const open = await isOpenForReading(event.table);
  const visibility = new Map<string, Promise<boolean>>();
  const row = event.record ?? event.old_record;

  for (const client of clients) {
    for (const [id, sub] of client.subs) {
      sub.changes.forEach(async (spec, index) => {
        if (spec.table && spec.table !== event.table) return;
        if (spec.schema && spec.schema !== '*' && spec.schema !== event.schema) return;
        if (spec.event !== '*' && spec.event !== event.type) return;
        if (!matchesFilter(spec.filter, row)) return;

        let old = event.old_record ?? {};
        if (!open) {
          if (event.type === 'DELETE') {
            // Linha já não existe para checar a policy: manda só a chave
            old = { id: event.old_record?.id };
          } else {
            const key = client.claims.sub ?? 'anon';
            if (!visibility.has(key)) visibility.set(key, canSee(client.claims, event.table, row?.id).catch(() => false));
            if (!(await visibility.get(key))) return;
          }
        }

        send(client, {
          type: 'postgres_changes',
          id,
          index,
          payload: {
            schema: event.schema,
            table: event.table,
            commit_timestamp: event.commit_timestamp,
            eventType: event.type,
            new: event.record ?? {},
            old,
            errors: null,
          },
        });
      });
    }
  }
}

// ---------------------------------------------------------------------------
// LISTEN no Postgres, com reconexão

async function listen() {
  const listener = new pg.Client({ connectionString: config.databaseUrl() });
  const reconnect = () => {
    listener.removeAllListeners();
    listener.end().catch(() => {});
    setTimeout(() => listen().catch((e) => console.error('[realtime] reconexão falhou:', e.message)), 2000);
  };
  listener.on('error', (err) => {
    console.error('[realtime] conexão LISTEN caiu:', err.message);
    reconnect();
  });
  listener.on('notification', (msg) => {
    if (msg.channel !== 'realtime' || !msg.payload) return;
    try {
      dispatchChange(JSON.parse(msg.payload)).catch((e) => console.error('[realtime] erro ao despachar:', e));
    } catch (e) {
      console.error('[realtime] payload inválido:', e);
    }
  });
  await listener.connect();
  await listener.query('LISTEN realtime');
  console.log('[realtime] escutando NOTIFY realtime');
}

// ---------------------------------------------------------------------------

export function attachRealtime(server: Server) {
  const wss = new WebSocketServer({ server, path: '/api/realtime' });

  wss.on('connection', (socket) => {
    const client: Client = { socket, claims: ANON_CLAIMS, subs: new Map() };
    clients.add(client);

    socket.on('message', (data) => {
      let msg: any;
      try {
        msg = JSON.parse(String(data));
      } catch {
        return;
      }
      switch (msg.type) {
        case 'auth':
          try {
            client.claims = msg.token ? verifyAccessToken(msg.token) : ANON_CLAIMS;
          } catch {
            client.claims = ANON_CLAIMS;
            send(client, { type: 'auth_error' });
          }
          break;
        case 'join':
          client.subs.set(String(msg.id), {
            topic: String(msg.topic),
            changes: Array.isArray(msg.changes) ? msg.changes : [],
            self: Boolean(msg.self),
          });
          send(client, { type: 'joined', id: msg.id });
          break;
        case 'leave':
          client.subs.delete(String(msg.id));
          break;
        case 'broadcast':
          for (const other of clients) {
            for (const [id, sub] of other.subs) {
              if (sub.topic !== String(msg.topic) || (other === client && !sub.self)) continue;
              send(other, { type: 'broadcast', id, event: msg.event, payload: msg.payload });
            }
          }
          break;
        case 'ping':
          send(client, { type: 'pong' });
          break;
      }
    });

    socket.on('close', () => clients.delete(client));
  });

  listen().catch((e) => console.error('[realtime] falha ao iniciar LISTEN:', e.message));
}
