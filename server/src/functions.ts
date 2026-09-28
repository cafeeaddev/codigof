/**
 * Porte das antigas Edge Functions do Supabase para rotas Express.
 * Mesmos nomes, mesmo corpo de requisição e mesmas respostas.
 */
import crypto from 'node:crypto';
import { Router, type Request } from 'express';
import { z } from 'zod';
import { config } from './config.js';
import { pool } from './db.js';
import { ApiError } from './query.js';
import {
  createUser, findUserByEmail, isAdmin, issueSession, requireUser, setPassword, verifyAccessToken,
} from './auth.js';

// --- Validações (antigo _shared/validation.ts das Edge Functions) ------------------

const emailSchema = z.string().trim().email().max(255);
const passwordSchema = z.string().min(8).max(128);
const nameSchema = z.string().trim().min(1).max(255).regex(/^[a-zA-ZÀ-ÿ\s'-]+$/);
const cpfSchema = z
  .string()
  .trim()
  .regex(/^(\d{4}|\d{11})$/)
  .refine((v) => v.length === 4 || validateCPF(v));

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  for (const len of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(digits[i]) * (len + 1 - i);
    let check = 11 - (sum % 11);
    if (check >= 10) check = 0;
    if (check !== parseInt(digits[len])) return false;
  }
  return true;
}

const rateLimits = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(key: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimits) if (now > value.resetTime) rateLimits.delete(key);
}, 300_000).unref();

async function requireAdmin(req: Request): Promise<string> {
  const claims = requireUser(req);
  if (!(await isAdmin(claims.sub))) throw new ApiError(403, 'Forbidden: Admin access required');
  return claims.sub;
}

/** Senha derivada do CPF, idêntica à da edge function original. */
function passwordFromCpf(cpf: string): string {
  return crypto.createHash('sha256').update(cpf + 'SECURE_SALT_2025_FMZ').digest().subarray(0, 12).toString('hex');
}

// --- Rotas -------------------------------------------------------------------

export const functionsRouter = Router();

functionsRouter.post('/auth-with-cpf', async (req, res) => {
  const email = emailSchema.safeParse(req.body?.email);
  const cpf = cpfSchema.safeParse(req.body?.cpf);
  if (!email.success) return res.status(400).json({ error: 'Email inválido' });
  if (!cpf.success) return res.status(400).json({ error: 'CPF inválido' });

  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0] || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(`auth:${ip}`, 5, 60_000)) {
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde um momento.' });
  }

  // Há e-mails com mais de um profile (mesmo CPF): usa sempre o mais antigo.
  const profileRes = await pool.query(
    `SELECT * FROM public.profiles WHERE email = $1 ORDER BY created_at, id LIMIT 1`,
    [email.data],
  );
  const profile = profileRes.rows[0];
  if (!profile) return res.status(401).json({ error: 'Email não encontrado ou usuário inativo' });

  const storedCpf = String(profile.cpf ?? '').replace(/\D/g, '');
  const inputCpf = cpf.data.replace(/\D/g, '');
  const storedLast4 = storedCpf.slice(-4);
  const inputLast4 = inputCpf.length === 4 ? inputCpf : inputCpf.slice(-4);
  if (!storedLast4 || storedLast4 !== inputLast4) return res.status(401).json({ error: 'CPF incorreto' });

  const password = passwordFromCpf(storedCpf);
  let user = await findUserByEmail(pool, email.data);
  let message = 'Autenticado com sucesso';
  if (user) {
    await setPassword(pool, user.id, password);
  } else {
    user = await createUser(pool, email.data, password, {
      nome: profile.nome,
      cpf: profile.cpf,
      skip_profile_creation: true,
    });
    message = 'Conta criada e autenticada';
  }
  // Vincula só este profile, e só se o usuário ainda não estiver ligado a outro (user_id é único)
  if (!profile.user_id) {
    await pool.query(
      `UPDATE public.profiles SET user_id = $1
        WHERE id = $2 AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = $1)`,
      [user.id, profile.id],
    );
  }

  const session = await issueSession(pool, user);
  res.json({ success: true, message, session, user: session.user });
});

functionsRouter.post('/reset-password', async (req, res) => {
  await requireAdmin(req);
  const email = emailSchema.safeParse(req.body?.email);
  const password = passwordSchema.safeParse(req.body?.newPassword);
  if (!email.success || !password.success) {
    return res.status(400).json({
      error: 'Invalid input data',
      details: { email: email.error?.issues, password: password.error?.issues },
    });
  }
  const user = await findUserByEmail(pool, email.data);
  if (!user) return res.status(400).json({ error: 'User not found' });
  await setPassword(pool, user.id, password.data);
  res.json({ success: true, message: 'Password reset successfully', user_id: user.id });
});

functionsRouter.post('/create-admin-user', async (req, res) => {
  await requireAdmin(req);
  const email = emailSchema.safeParse(req.body?.email);
  const password = passwordSchema.safeParse(req.body?.password);
  const nome = nameSchema.safeParse(req.body?.nome);
  const cpf = cpfSchema.safeParse(req.body?.cpf);
  if (!email.success || !password.success || !nome.success || !cpf.success) {
    return res.status(400).json({
      error: 'Invalid input data',
      details: {
        email: email.error?.issues, password: password.error?.issues,
        nome: nome.error?.issues, cpf: cpf.error?.issues,
      },
    });
  }

  const existing = await findUserByEmail(pool, email.data);
  const user = existing ?? (await createUser(pool, email.data, password.data, {
    nome: nome.data, cpf: cpf.data, skip_profile_creation: true,
  }));

  await pool
    .query(
      `INSERT INTO public.profiles (user_id, nome, email, cpf, area, cargo)
       VALUES ($1, $2, $3, $4, 'Administração', 'Administrador')
       ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, nome = EXCLUDED.nome,
         email = EXCLUDED.email, cpf = EXCLUDED.cpf, area = EXCLUDED.area, cargo = EXCLUDED.cargo`,
      [user.id, nome.data, email.data, cpf.data],
    )
    .catch((e) => console.error('[create-admin-user] erro no profile:', e.message));

  await pool.query(
    `INSERT INTO public.user_roles (user_id, role)
     SELECT $1, 'admin' WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = $1 AND role = 'admin')`,
    [user.id],
  );

  res.json({
    success: true,
    message: existing ? 'Admin role granted to existing user' : 'Admin user created successfully',
    user_id: user.id,
  });
});

functionsRouter.post('/tutorial-narration', async (req, res) => {
  const { text, voice } = req.body ?? {};
  if (!text) return res.status(400).json({ error: 'Text is required' });
  if (!config.openaiApiKey) return res.status(400).json({ error: 'OPENAI_API_KEY is not set' });

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.openaiApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'tts-1', input: text, voice: voice || 'alloy', response_format: 'mp3' }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return res.status(400).json({ error: error?.error?.message || 'Failed to generate speech' });
  }
  const audioContent = Buffer.from(await response.arrayBuffer()).toString('base64');
  res.json({ audioContent });
});

// API externa (token fixo USERS_API_TOKEN ou JWT de admin)
async function usersApiHandler(req: Request, res: import('express').Response) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing authorization header' });
  const token = header.replace('Bearer ', '');
  if (!(config.usersApiToken && token === config.usersApiToken)) {
    const claims = verifyAccessToken(token);
    if (!claims.sub || !(await isAdmin(claims.sub))) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
  }

  const q = (sql: string) => pool.query(sql).then((r) => r.rows).catch(() => [] as any[]);
  const [profiles, progress, mission4, manualXP, terms, forms] = await Promise.all([
    pool.query(`SELECT email, nome, user_id FROM public.profiles`).then((r) => r.rows),
    pool.query(`SELECT user_id, total_xp, missao_1_completed, missao_2_completed, missao_3_completed,
                       missao_4_completed, missao_5_completed, final_profile FROM public.user_progress`).then((r) => r.rows),
    q(`SELECT email, respostas FROM public.respostas_missao4`),
    q(`SELECT email, xp_value FROM public.manual_xp_adjustments`),
    q(`SELECT user_id, accepted_terms, want_to_participate, decline_reason, created_at FROM public.fast_track_terms_responses`),
    q(`SELECT user_id, main_objective, other_objective, time_commitment, interest_level, created_at FROM public.fast_track_responses`),
  ]);

  const users = profiles.map((profile) => {
    const p = progress.find((up) => up.user_id === profile.user_id) ?? {};
    const xp = manualXP.find((x) => x.email === profile.email);
    const t = terms.find((x) => x.user_id === profile.user_id);
    const f = forms.find((x) => x.user_id === profile.user_id);
    const done = [p.missao_1_completed, p.missao_2_completed, p.missao_3_completed, p.missao_4_completed, p.missao_5_completed];
    return {
      email: profile.email,
      nome: profile.nome,
      total_xp: p.total_xp || 0,
      manual_xp_adjustment: xp ? { xp_value: xp.xp_value, has_adjustment: true } : { xp_value: 0, has_adjustment: false },
      missions_completed: {
        missao_1: p.missao_1_completed || false,
        missao_2: p.missao_2_completed || false,
        missao_3: p.missao_3_completed || false,
        missao_4: p.missao_4_completed || false,
        missao_5: p.missao_5_completed || false,
      },
      total_missions_completed: done.filter(Boolean).length,
      final_profile: p.final_profile || null,
      competencies: extractCompetencies(mission4.find((r) => r.email === profile.email)?.respostas),
      extra_mission: {
        terms_response: t
          ? { accepted_terms: t.accepted_terms, want_to_participate: t.want_to_participate,
              decline_reason: t.decline_reason || null, responded_at: t.created_at }
          : null,
        form_response: f
          ? { main_objective: f.main_objective, other_objective: f.other_objective,
              time_commitment: f.time_commitment, interest_level: f.interest_level, submitted_at: f.created_at }
          : null,
      },
    };
  });

  res.json({ success: true, total_users: users.length, users });
}
functionsRouter.get('/users-api', usersApiHandler);
functionsRouter.post('/users-api', usersApiHandler);

function extractCompetencies(respostas: any) {
  const softwareSkills: Record<string, number> = {};
  const allRatings: number[] = [];
  for (const questionRatings of Object.values(respostas?.starRatings ?? {})) {
    if (!questionRatings || typeof questionRatings !== 'object') continue;
    for (const [software, rating] of Object.entries(questionRatings as Record<string, unknown>)) {
      const n = Number(rating);
      if (!Number.isNaN(n) && n > 0) {
        softwareSkills[software] = n;
        allRatings.push(n);
      }
    }
  }
  return {
    software_skills: softwareSkills,
    total_skills_evaluated: Object.keys(softwareSkills).length,
    average_rating: allRatings.length
      ? Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
      : 0,
  };
}
