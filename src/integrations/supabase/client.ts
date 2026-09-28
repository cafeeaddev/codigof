/**
 * Cliente compatível com o subconjunto da API do supabase-js usado pelo app,
 * mas falando com o backend próprio (server/), que roda sobre um PostgreSQL local.
 *
 * Mantém a mesma interface (`supabase.from(...).select().eq()...`, `auth`,
 * `rpc`, `functions.invoke`, `channel`) para que as telas não precisem mudar.
 *
 * import { supabase } from "@/integrations/supabase/client";
 */

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '/api';
const STORAGE_KEY = 'app-auth-session';

// ---------------------------------------------------------------------------
// Tipos

export interface User {
  id: string;
  email?: string;
  aud: string;
  role?: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  created_at: string;
  [key: string]: any;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: User;
}

export interface PostgrestError {
  message: string;
  code: string;
  details: string | null;
  hint: string | null;
}

export interface PostgrestResponse<T = any> {
  data: T;
  error: PostgrestError | null;
  count: number | null;
  status: number;
  statusText: string;
}

export type AuthChangeEvent =
  | 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';

class AuthError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'AuthApiError';
  }
}

// ---------------------------------------------------------------------------
// HTTP

async function request(path: string, init: RequestInit & { token?: string | null } = {}) {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (init.token) headers.set('Authorization', `Bearer ${init.token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const text = await response.text();
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { response, body };
}

// ---------------------------------------------------------------------------
// Auth

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

class AuthClient {
  private session: Session | null = null;
  private listeners = new Set<AuthListener>();
  private refreshing: Promise<Session | null> | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private initialized: Promise<void>;

  constructor() {
    this.session = this.readStorage();
    this.initialized = this.session ? this.ensureFresh().then(() => undefined) : Promise.resolve();
    if (typeof window !== 'undefined') {
      // Login/logout em outra aba
      window.addEventListener('storage', (e) => {
        if (e.key !== STORAGE_KEY) return;
        const next = this.readStorage();
        const event: AuthChangeEvent = next ? (this.session ? 'TOKEN_REFRESHED' : 'SIGNED_IN') : 'SIGNED_OUT';
        this.session = next;
        this.scheduleRefresh();
        this.emit(event);
      });
    }
    this.scheduleRefresh();
  }

  private readStorage(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }

  private save(session: Session | null, event: AuthChangeEvent) {
    this.session = session;
    try {
      if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* armazenamento indisponível: sessão fica só em memória */
    }
    this.scheduleRefresh();
    this.emit(event);
  }

  private emit(event: AuthChangeEvent) {
    for (const listener of this.listeners) {
      try {
        listener(event, this.session);
      } catch (e) {
        console.error('[auth] erro em listener:', e);
      }
    }
  }

  private scheduleRefresh() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    if (!this.session) return;
    const ms = this.session.expires_at * 1000 - Date.now() - 60_000;
    this.refreshTimer = setTimeout(() => void this.refresh(), Math.max(ms, 1_000));
  }

  private async refresh(): Promise<Session | null> {
    if (this.refreshing) return this.refreshing;
    const current = this.session;
    if (!current) return null;
    this.refreshing = (async () => {
      try {
        const { response, body } = await request('/auth/token?grant_type=refresh_token', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: current.refresh_token }),
        });
        if (response.ok) {
          this.save(body as Session, 'TOKEN_REFRESHED');
        } else if (response.status >= 400 && response.status < 500) {
          // Refresh token inválido/expirado: sessão acabou
          this.save(null, 'SIGNED_OUT');
        }
      } catch (e) {
        console.warn('[auth] falha ao renovar sessão (rede):', e);
      } finally {
        this.refreshing = null;
      }
      return this.session;
    })();
    return this.refreshing;
  }

  private async ensureFresh(): Promise<Session | null> {
    if (!this.session) return null;
    if (this.session.expires_at * 1000 - Date.now() < 30_000) return this.refresh();
    return this.session;
  }

  /** Token atual (renovado se estiver para expirar); usado por todas as chamadas. */
  async getAccessToken(): Promise<string | null> {
    await this.initialized;
    return (await this.ensureFresh())?.access_token ?? null;
  }

  async getSession() {
    await this.initialized;
    return { data: { session: await this.ensureFresh() }, error: null };
  }

  async getUser(jwt?: string) {
    const token = jwt ?? (await this.getAccessToken());
    if (!token) return { data: { user: null }, error: new AuthError('Auth session missing!', 400) };
    const { response, body } = await request('/auth/user', { token });
    if (!response.ok) return { data: { user: null }, error: new AuthError(body?.message ?? 'Invalid session', response.status) };
    return { data: { user: body as User }, error: null };
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const { response, body } = await request('/auth/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      return {
        data: { user: null, session: null },
        error: new AuthError(body?.message ?? 'Invalid login credentials', response.status, body?.code),
      };
    }
    this.save(body as Session, 'SIGNED_IN');
    return { data: { user: (body as Session).user, session: body as Session }, error: null };
  }

  async setSession({ access_token, refresh_token }: { access_token: string; refresh_token: string }) {
    const { data, error } = await this.getUser(access_token);
    if (error || !data.user) return { data: { user: null, session: null }, error: error ?? new AuthError('Invalid session') };
    let expiresAt = Math.floor(Date.now() / 1000) + 3600;
    try {
      expiresAt = JSON.parse(atob(access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp;
    } catch {
      /* usa o padrão */
    }
    const session: Session = {
      access_token,
      refresh_token,
      token_type: 'bearer',
      expires_at: expiresAt,
      expires_in: expiresAt - Math.floor(Date.now() / 1000),
      user: data.user,
    };
    this.save(session, 'SIGNED_IN');
    return { data: { user: data.user, session }, error: null };
  }

  async refreshSession() {
    const session = await this.refresh();
    return { data: { session, user: session?.user ?? null }, error: session ? null : new AuthError('Auth session missing!') };
  }

  async signOut() {
    const token = this.session?.access_token;
    this.save(null, 'SIGNED_OUT');
    if (token) await request('/auth/logout', { method: 'POST', token }).catch(() => {});
    return { error: null };
  }

  onAuthStateChange(callback: AuthListener) {
    this.listeners.add(callback);
    // Como no supabase-js: dispara INITIAL_SESSION de forma assíncrona
    void this.initialized.then(() => {
      if (this.listeners.has(callback)) callback('INITIAL_SESSION', this.session);
    });
    return {
      data: {
        subscription: {
          id: Math.random().toString(36).slice(2),
          callback,
          unsubscribe: () => {
            this.listeners.delete(callback);
          },
        },
      },
    };
  }
}

const auth = new AuthClient();

// ---------------------------------------------------------------------------
// Consultas (equivalente ao PostgrestQueryBuilder)

type Method = 'select' | 'insert' | 'update' | 'upsert' | 'delete';
type CountOption = 'exact' | 'planned' | 'estimated';

function toError(body: any, status: number): PostgrestError {
  return {
    message: body?.message ?? body?.error ?? (typeof body === 'string' ? body : `HTTP ${status}`),
    code: body?.code ?? String(status),
    details: body?.details ?? null,
    hint: body?.hint ?? null,
  };
}

class QueryBuilder<T = any> implements PromiseLike<PostgrestResponse<T>> {
  private req: Record<string, any>;
  private shouldThrow = false;

  constructor(table: string) {
    this.req = { table, method: null, filters: [], order: [] };
  }

  // --- operações
  select(columns = '*', options: { count?: CountOption; head?: boolean } = {}) {
    if (!this.req.method) {
      this.req.method = 'select';
      if (options.head) this.req.head = true;
    } else {
      this.req.returning = true;
    }
    this.req.columns = columns;
    if (options.count) this.req.count = options.count;
    return this;
  }

  insert(values: any, options: { count?: CountOption; defaultToNull?: boolean } = {}) {
    Object.assign(this.req, { method: 'insert', values, count: options.count });
    return this;
  }

  upsert(values: any, options: { onConflict?: string; ignoreDuplicates?: boolean; count?: CountOption } = {}) {
    Object.assign(this.req, {
      method: 'upsert', values, onConflict: options.onConflict,
      ignoreDuplicates: options.ignoreDuplicates, count: options.count,
    });
    return this;
  }

  update(values: any, options: { count?: CountOption } = {}) {
    Object.assign(this.req, { method: 'update', values, count: options.count });
    return this;
  }

  delete(options: { count?: CountOption } = {}) {
    Object.assign(this.req, { method: 'delete', count: options.count });
    return this;
  }

  // --- filtros
  private op(column: string, op: string, value: unknown) {
    this.req.filters.push({ type: 'op', column, op, value });
    return this;
  }
  eq(column: string, value: unknown) { return this.op(column, 'eq', value); }
  neq(column: string, value: unknown) { return this.op(column, 'neq', value); }
  gt(column: string, value: unknown) { return this.op(column, 'gt', value); }
  gte(column: string, value: unknown) { return this.op(column, 'gte', value); }
  lt(column: string, value: unknown) { return this.op(column, 'lt', value); }
  lte(column: string, value: unknown) { return this.op(column, 'lte', value); }
  like(column: string, pattern: string) { return this.op(column, 'like', pattern.replace(/\*/g, '%')); }
  ilike(column: string, pattern: string) { return this.op(column, 'ilike', pattern.replace(/\*/g, '%')); }
  is(column: string, value: null | boolean) { return this.op(column, 'is', value); }
  in(column: string, values: readonly unknown[]) { return this.op(column, 'in', values); }
  contains(column: string, value: unknown) { return this.op(column, 'cs', value); }
  containedBy(column: string, value: unknown) { return this.op(column, 'cd', value); }
  overlaps(column: string, value: unknown) { return this.op(column, 'ov', value); }

  match(query: Record<string, unknown>) {
    for (const [column, value] of Object.entries(query)) this.eq(column, value);
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    this.req.filters.push({ type: 'raw', column, op: operator, value: String(value), negate: true });
    return this;
  }

  filter(column: string, operator: string, value: unknown) {
    this.req.filters.push({ type: 'raw', column, op: operator, value: String(value) });
    return this;
  }

  or(expr: string) {
    this.req.filters.push({ type: 'or', expr });
    return this;
  }

  // --- modificadores
  order(column: string, options: { ascending?: boolean; nullsFirst?: boolean } = {}) {
    this.req.order.push({ column, ascending: options.ascending, nullsFirst: options.nullsFirst });
    return this;
  }

  limit(count: number) {
    this.req.limit = count;
    return this;
  }

  range(from: number, to: number) {
    this.req.offset = from;
    this.req.limit = to - from + 1;
    return this;
  }

  single() {
    this.req.single = 'single';
    return this as unknown as QueryBuilder<any>;
  }

  maybeSingle() {
    this.req.single = 'maybe';
    return this as unknown as QueryBuilder<any>;
  }

  abortSignal(_signal: AbortSignal) { return this; }
  returns<U>() { return this as unknown as QueryBuilder<U>; }
  throwOnError() {
    this.shouldThrow = true;
    return this;
  }

  // --- execução
  private async execute(): Promise<PostgrestResponse<T>> {
    if (!this.req.method) this.req.method = 'select';
    try {
      const { response, body } = await request('/rest', {
        method: 'POST',
        body: JSON.stringify(this.req),
        token: await auth.getAccessToken(),
      });
      if (!response.ok) {
        const error = toError(body, response.status);
        if (this.shouldThrow) throw error;
        return { data: null as T, error, count: null, status: response.status, statusText: response.statusText };
      }
      return {
        data: (body?.data ?? null) as T,
        error: null,
        count: body?.count ?? null,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (e: any) {
      if (this.shouldThrow) throw e;
      return {
        data: null as T,
        error: { message: `${e?.name ?? 'Error'}: ${e?.message ?? e}`, code: '', details: null, hint: null },
        count: null,
        status: 0,
        statusText: '',
      };
    }
  }

  then<R1 = PostgrestResponse<T>, R2 = never>(
    onfulfilled?: ((value: PostgrestResponse<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null,
  ): Promise<R1 | R2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

// ---------------------------------------------------------------------------
// RPC e Functions

async function rpc<T = any>(fn: string, args: Record<string, unknown> = {}): Promise<PostgrestResponse<T>> {
  try {
    const { response, body } = await request(`/rpc/${encodeURIComponent(fn)}`, {
      method: 'POST',
      body: JSON.stringify(args),
      token: await auth.getAccessToken(),
    });
    if (!response.ok) {
      return { data: null as T, error: toError(body, response.status), count: null, status: response.status, statusText: response.statusText };
    }
    return { data: body?.data as T, error: null, count: null, status: response.status, statusText: response.statusText };
  } catch (e: any) {
    return { data: null as T, error: { message: String(e?.message ?? e), code: '', details: null, hint: null }, count: null, status: 0, statusText: '' };
  }
}

class FunctionsHttpError extends Error {
  name = 'FunctionsHttpError';
  constructor(public context: Response, public body: any) {
    super('Edge Function returned a non-2xx status code');
  }
}

const functions = {
  async invoke<T = any>(name: string, options: { body?: unknown; headers?: Record<string, string> } = {}) {
    try {
      const { response, body } = await request(`/functions/${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: options.headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        token: await auth.getAccessToken(),
      });
      if (!response.ok) return { data: null, error: new FunctionsHttpError(response, body) };
      return { data: body as T, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },
};

// ---------------------------------------------------------------------------
// Realtime (WebSocket com o servidor)

type ChangeFilter = { event: string; schema?: string; table?: string; filter?: string };
type Binding =
  | { type: 'postgres_changes'; filter: ChangeFilter; callback: (payload: any) => void }
  | { type: 'broadcast'; event: string; callback: (payload: any) => void };

let channelSeq = 0;

class RealtimeChannel {
  readonly id = `c${++channelSeq}`;
  private bindings: Binding[] = [];
  private statusCallback?: (status: string, err?: Error) => void;
  joined = false;
  wantsJoin = false;

  constructor(readonly topic: string, private socket: RealtimeSocket, private opts: { config?: { broadcast?: { self?: boolean } } } = {}) {}

  on(type: 'postgres_changes' | 'broadcast' | 'presence', filter: any, callback: (payload: any) => void) {
    if (type === 'postgres_changes') this.bindings.push({ type, filter, callback });
    else if (type === 'broadcast') this.bindings.push({ type, event: filter?.event ?? '*', callback });
    return this;
  }

  subscribe(callback?: (status: string, err?: Error) => void) {
    this.statusCallback = callback;
    this.wantsJoin = true;
    this.socket.join(this);
    return this;
  }

  joinMessage() {
    return {
      type: 'join',
      id: this.id,
      topic: this.topic,
      self: Boolean(this.opts.config?.broadcast?.self),
      changes: this.bindings.filter((b) => b.type === 'postgres_changes').map((b) => (b as any).filter),
    };
  }

  handleJoined() {
    this.joined = true;
    this.statusCallback?.('SUBSCRIBED');
  }

  handleClosed() {
    if (this.joined) this.statusCallback?.('CLOSED');
    this.joined = false;
  }

  handleChange(index: number, payload: any) {
    const changeBindings = this.bindings.filter((b) => b.type === 'postgres_changes');
    changeBindings[index]?.callback(payload);
  }

  handleBroadcast(event: string, payload: any) {
    for (const b of this.bindings) {
      if (b.type === 'broadcast' && (b.event === '*' || b.event === event)) {
        b.callback({ type: 'broadcast', event, payload });
      }
    }
  }

  async send(message: { type: string; event: string; payload?: any }) {
    if (message.type !== 'broadcast') return 'error';
    this.socket.sendRaw({ type: 'broadcast', topic: this.topic, event: message.event, payload: message.payload });
    return 'ok';
  }

  async unsubscribe() {
    this.wantsJoin = false;
    this.socket.leave(this);
    this.handleClosed();
    return 'ok';
  }
}

class RealtimeSocket {
  private ws: WebSocket | null = null;
  private channels = new Map<string, RealtimeChannel>();
  private queue: string[] = [];
  private retries = 0;
  private heartbeat: ReturnType<typeof setInterval> | null = null;

  constructor() {
    auth.onAuthStateChange((event) => {
      if (event !== 'INITIAL_SESSION') void this.sendAuth();
    });
  }

  private url() {
    const base = API_URL.startsWith('http') ? API_URL : `${location.origin}${API_URL}`;
    return `${base.replace(/^http/, 'ws')}/realtime`;
  }

  private connect() {
    if (this.ws && this.ws.readyState <= WebSocket.OPEN) return;
    const ws = new WebSocket(this.url());
    this.ws = ws;
    ws.onopen = async () => {
      this.retries = 0;
      await this.sendAuth();
      for (const ch of this.channels.values()) if (ch.wantsJoin) this.sendRaw(ch.joinMessage());
      const pending = this.queue.splice(0);
      pending.forEach((m) => ws.send(m));
      if (this.heartbeat) clearInterval(this.heartbeat);
      this.heartbeat = setInterval(() => this.sendRaw({ type: 'ping' }), 25_000);
    };
    ws.onmessage = (e) => {
      let msg: any;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      const ch = msg.id ? this.channels.get(msg.id) : undefined;
      if (msg.type === 'joined') ch?.handleJoined();
      else if (msg.type === 'postgres_changes') ch?.handleChange(msg.index, msg.payload);
      else if (msg.type === 'broadcast') ch?.handleBroadcast(msg.event, msg.payload);
    };
    ws.onclose = () => {
      if (this.heartbeat) clearInterval(this.heartbeat);
      this.ws = null;
      for (const ch of this.channels.values()) ch.handleClosed();
      if (this.channels.size === 0) return;
      const delay = Math.min(1000 * 2 ** this.retries++, 10_000);
      setTimeout(() => this.connect(), delay);
    };
  }

  private async sendAuth() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'auth', token: await auth.getAccessToken() }));
  }

  sendRaw(message: unknown) {
    const data = JSON.stringify(message);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      this.queue.push(data);
      this.connect();
    }
  }

  register(channel: RealtimeChannel) {
    this.channels.set(channel.id, channel);
  }

  join(channel: RealtimeChannel) {
    this.channels.set(channel.id, channel);
    if (this.ws?.readyState === WebSocket.OPEN) this.sendRaw(channel.joinMessage());
    else this.connect();
  }

  leave(channel: RealtimeChannel) {
    if (this.channels.delete(channel.id) && this.ws?.readyState === WebSocket.OPEN) {
      this.sendRaw({ type: 'leave', id: channel.id });
    }
    if (this.channels.size === 0 && this.ws) {
      this.queue = [];
      this.ws.close();
    }
  }

  all() {
    return [...this.channels.values()];
  }
}

let realtime: RealtimeSocket | null = null;
const getRealtime = () => (realtime ??= new RealtimeSocket());

// ---------------------------------------------------------------------------

export const supabase = {
  from: <T = any>(table: string) => new QueryBuilder<T>(table),
  rpc,
  auth,
  functions,
  channel(topic: string, opts?: { config?: { broadcast?: { self?: boolean } } }) {
    const socket = getRealtime();
    const channel = new RealtimeChannel(topic, socket, opts);
    socket.register(channel);
    return channel;
  },
  async removeChannel(channel: RealtimeChannel) {
    return channel.unsubscribe();
  },
  async removeAllChannels() {
    return Promise.all(getRealtime().all().map((c) => c.unsubscribe()));
  },
  getChannels() {
    return getRealtime().all();
  },
};
