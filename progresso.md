# Progresso — Código F fora do Lovable/Supabase

Última atualização: 2026-09-28

## Objetivo

Tirar o Código F do Lovable e do Supabase e colocá-lo no ar num servidor próprio, em
**codigof.com.br**, com os dados atuais da produção.

## Situação atual

| Etapa | Status |
|---|---|
| Backend próprio (`server/`) substituindo Supabase e edge functions | ✅ feito |
| Banco local (PostgreSQL 18) com cópia idêntica da produção | ✅ feito |
| Bug do login com e-mail duplicado (66 pessoas) corrigido | ✅ feito (no código novo) |
| Mensagens reais de erro no login (em vez de "Erro interno") | ✅ feito |
| Limpeza dos restos do Lovable | ✅ feito |
| Código no repositório novo `github.com/cafeeaddev/codigof` | ✅ feito |
| Guia de deploy para o SRE no README | ✅ feito |
| Comandos `db:backup` / `db:restore` e rota `/api/health` | ✅ feito e testado |
| Backup dos dados para o SRE | ✅ gerado (`server/.data/codigof-backup-2026-09-28.sql.gz`) |
| Envio ao SRE (convite, backup, variáveis, README) | ⏳ em andamento |
| SRE sobe o servidor e valida pelo IP | ⏳ aguardando |
| Teste no navegador: painel admin e quiz ao vivo | ⏳ pendente |
| Dia da virada: backup novo + troca do DNS + HTTPS | ⏳ pendente |
| Desligar Lovable e Supabase | ⏳ depois de alguns dias estável |

## Testado

- 35 testes da API (login, RLS, consultas, reset de senha, tempo real, injeção de SQL).
- Cópia da produção: mesmo número de linhas nas 39 tabelas + 849 usuários de login.
- Login por CPF: usuário normal, usuário com cadastro duplicado, CPF errado, e-mail inexistente,
  admin (`cafeead@cafeead.com.br`).
- Ciclo do SRE simulado: `db:migrate` num banco novo → `db:restore` → conteúdo idêntico nas 40
  tabelas → `npm start` servindo site, `/admin`, imagens, login e WebSocket do tempo real.
- `/api/health` responde `ok` com o banco no ar e `503` com o banco fora.

**Não testado:** um servidor Linux de verdade; painel admin e quiz ao vivo pelo navegador.

## Decisões pendentes

1. **Perfis duplicados:** 66 e-mails têm 2 perfis em `profiles` (mesmo CPF). O login já funciona;
   falta decidir se juntamos cada par num perfil só.
2. **Limite de tentativas do login:** 5 por minuto **por IP**. Num evento em rede corporativa
   todos saem pelo mesmo IP. Avaliar aumentar ou limitar por e-mail.
3. **Site atual (Lovable):** continua com o bug do login para as 66 pessoas até a virada.

## Observações

- O perfil do admin `cafeead@cafeead.com.br` foi criado só no banco local,
  para testes; ele vai junto no backup.
- Na produção antiga esse admin não tem perfil, então não entra pela página principal de lá.
- Detalhes técnicos e decisões: `historico.md`. Deploy: `deploy.md` e `README.md`.
