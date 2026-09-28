# Código F

Plataforma web do Código F (missões, quizzes ao vivo e painel administrativo), no ar em
**codigof.com.br**.

- [Colocar o sistema no ar (guia para SRE)](#colocar-o-sistema-no-ar-guia-para-sre)
- [Operação do dia a dia](#operação-do-dia-a-dia)
- [Problemas comuns](#problemas-comuns)
- [Para desenvolvedores](#para-desenvolvedores)

---

## Colocar o sistema no ar (guia para SRE)

Este guia parte do zero: um servidor Linux vazio. Não é preciso conhecer o código. Siga os
passos na ordem e copie os comandos como estão; o que está entre `<sinais assim>` você troca
pelo valor real.

### Visão geral

O sistema é **um único processo Node.js** que entrega o site e a API, e guarda tudo num
**PostgreSQL** na mesma máquina. Um **nginx** na frente cuida do domínio e do HTTPS.

```
usuário ──HTTPS──▶ nginx (80/443) ──▶ app Node.js (porta 3001, só local) ──▶ PostgreSQL (5432, só local)
```

- O app **não depende de nenhum serviço externo** (não usa Supabase nem Lovable).
- O "tempo real" dos quizzes usa **WebSocket** no caminho `/api/realtime`; o nginx precisa
  repassá-lo (a configuração abaixo já faz isso).
- Única chamada externa: a API da OpenAI, só para a narração do tutorial (opcional).

**Você vai receber:**

| O quê | Como chega | Para quê |
|---|---|---|
| Acesso ao repositório `github.com/cafeeaddev/codigof` | convite no GitHub | baixar o código |
| Arquivo `codigof-backup-AAAA-MM-DD.sql.gz` | canal privado | dados do sistema (usuários, respostas) |
| Valores das variáveis de ambiente | canal privado | chaves e senhas (passo 5) |

> ⚠️ O backup contém **dados pessoais** (nomes, e-mails, CPFs) e hashes de senha. Não coloque em
> repositório, não deixe em pasta pública e apague as cópias temporárias depois de restaurar.

### 1. Servidor

| Item | Recomendado |
|---|---|
| Sistema | **Ubuntu 24.04 LTS** (os comandos abaixo são para ele) |
| CPU / memória | 2 vCPU / **4 GB de RAM** (o passo de build usa bastante memória) |
| Disco | 20 GB |
| Portas abertas na internet | 22 (SSH), 80 (HTTP), 443 (HTTPS). **Nada mais.** |
| IP | **fixo (público)**: o domínio vai apontar para ele |

Anote o **IP público** do servidor: ele é necessário no passo 12.

### 2. Instalar os programas

Conecte por SSH e rode:

```sh
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx certbot python3-certbot-nginx ufw

# Node.js 22 (LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 18 (precisa ser 18: o backup e o schema foram gerados nessa versão)
sudo apt install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y
sudo apt install -y postgresql-18
```

Confira as versões:

```sh
node -v        # v22.x
psql --version # psql (PostgreSQL) 18.x
```

### 3. Baixar o código

O app roda com um usuário próprio do Linux, `codigof`, dentro de `/opt/codigof`.

```sh
sudo adduser --system --group --home /opt/codigof --shell /bin/bash codigof
sudo -u codigof git clone https://github.com/cafeeaddev/codigof.git /opt/codigof/app
```

O repositório é privado. Se o `git clone` pedir usuário e senha, use seu usuário do GitHub e,
como senha, um **Personal Access Token** (GitHub → Settings → Developer settings → Personal
access tokens) com permissão de leitura no repositório. Alternativa: cadastrar uma *deploy key*
do servidor no repositório.

Daqui em diante, todos os comandos do app são rodados **dentro da pasta do app, como o usuário
`codigof`**:

```sh
sudo -iu codigof
cd /opt/codigof/app
```

(Para voltar ao seu usuário: `exit`.)

### 4. Definir a senha do administrador do PostgreSQL

Com o **seu** usuário (não o `codigof`), escolha uma senha forte e rode:

```sh
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '<SENHA_DO_POSTGRES>'"
```

Guarde essa senha: ela vai no passo 5. O PostgreSQL fica acessível **só de dentro do servidor**
(é o padrão da instalação; não altere).

### 5. Configurar as variáveis de ambiente

As configurações do app ficam no arquivo `server/.env`, que **nunca** vai para o repositório.
Como usuário `codigof`, dentro de `/opt/codigof/app`:

```sh
cp server/.env.example server/.env
nano server/.env
```

Deixe o arquivo assim (apague as outras linhas):

```ini
PORT=3001
DATABASE_URL=postgresql://app_server:<SENHA_DO_APP>@localhost:5432/codigof
ADMIN_DATABASE_URL=postgresql://postgres:<SENHA_DO_POSTGRES>@localhost:5432/postgres
JWT_SECRET=<SEGREDO_JWT>
OPENAI_API_KEY=<CHAVE_OPENAI>
USERS_API_TOKEN=<TOKEN_API_USUARIOS>
```

| Variável | O que é | Quem fornece |
|---|---|---|
| `PORT` | porta interna do app | deixe `3001` |
| `DATABASE_URL` | conexão que o app usa. O usuário `app_server` é **criado automaticamente** no passo 6 com a senha que você colocar aqui | você inventa `<SENHA_DO_APP>` (só letras e números) |
| `ADMIN_DATABASE_URL` | conexão de administrador, usada só para criar e restaurar o banco | a senha do passo 4 |
| `JWT_SECRET` | segredo que assina os logins | enviado em privado. Se não vier, gere com: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `OPENAI_API_KEY` | narração do tutorial | enviado em privado (opcional: sem ela só a narração não funciona) |
| `USERS_API_TOKEN` | token da API externa de usuários | enviado em privado (opcional) |

Não há `SOURCE_DATABASE_URL` em produção (ela só servia para copiar dados do Supabase antigo).

> Senhas com os caracteres `@ # % / ? : &` precisam ser escritas codificadas dentro das URLs
> (ex.: `@` vira `%40`). Mais simples: use senhas só com letras e números.

Proteja o arquivo:

```sh
chmod 600 server/.env
```

### 6. Instalar as dependências e criar o banco

Como `codigof`, em `/opt/codigof/app`:

```sh
npm ci
npm run db:migrate
```

O `db:migrate` cria o banco `codigof`, o usuário `app_server` e toda a estrutura (tabelas,
permissões, funções). Deve terminar com **`Banco pronto.`**

> Use `npm ci` (e não `npm ci --omit=dev`): o app precisa das ferramentas de desenvolvimento
> para iniciar.

### 7. Carregar os dados (backup)

Copie o backup recebido para o servidor (do seu computador):

```sh
scp codigof-backup-AAAA-MM-DD.sql.gz <seu_usuario>@<IP_DO_SERVIDOR>:/tmp/
```

No servidor, com o **seu** usuário:

```sh
sudo mv /tmp/codigof-backup-*.sql.gz /opt/codigof/
sudo chown codigof:codigof /opt/codigof/codigof-backup-*.sql.gz
```

Como `codigof`, em `/opt/codigof/app`:

```sh
gunzip /opt/codigof/codigof-backup-AAAA-MM-DD.sql.gz
npm run db:restore -- /opt/codigof/codigof-backup-AAAA-MM-DD.sql
```

Deve terminar com algo como **`Restauração concluída: 850 usuários de login, 1217 perfis.`**
O comando apaga o que houver no banco e carrega o backup; se der erro no meio, nada é gravado
e dá para rodar de novo.

Depois de conferir, apague o arquivo: `rm /opt/codigof/codigof-backup-*.sql`

### 8. Gerar o site e testar

Como `codigof`, em `/opt/codigof/app`:

```sh
npm run build
npm start
```

Deve aparecer `API ouvindo em http://localhost:3001`. Em **outro terminal** no servidor:

```sh
curl http://localhost:3001/api/health
```

Resposta esperada: `{"status":"ok"}`. Volte ao primeiro terminal e pare o app com `Ctrl+C`.

### 9. Deixar o app rodando como serviço

Assim ele sobe sozinho quando o servidor reinicia e volta se cair. Com o **seu** usuário:

```sh
sudo tee /etc/systemd/system/codigof.service > /dev/null <<'EOF'
[Unit]
Description=Codigo F
After=network.target postgresql.service
Requires=postgresql.service

[Service]
User=codigof
WorkingDirectory=/opt/codigof/app
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now codigof
sudo systemctl status codigof     # deve mostrar "active (running)"
curl http://localhost:3001/api/health
```

### 10. Configurar o nginx

```sh
sudo tee /etc/nginx/sites-available/codigof > /dev/null <<'EOF'
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name codigof.com.br www.codigof.com.br;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;

        # WebSocket (tempo real dos quizzes)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 3600s;

        proxy_set_header Host $host;
        # IP real do usuário (usado no limite de tentativas de login)
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/codigof /etc/nginx/sites-enabled/codigof
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t                  # deve dizer "syntax is ok" e "test is successful"
sudo systemctl reload nginx
```

Teste pelo IP, do seu computador (antes de mexer no domínio):

```sh
curl -H "Host: codigof.com.br" http://<IP_DO_SERVIDOR>/api/health
```

### 11. Firewall

```sh
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status      # só OpenSSH e Nginx Full liberados
```

A porta 3001 (app) e a 5432 (banco) **não** devem ficar abertas para a internet.

### 12. Apontar o domínio para o servidor

> ⚠️ **Hoje o codigof.com.br aponta para o Lovable.** Enquanto o DNS não for trocado, os
> usuários continuam indo para o site antigo. Essa troca é feita por quem administra o DNS do
> domínio (painel do Registro.br ou do provedor de DNS), **não** no servidor.

Envie ao responsável pelo DNS o **IP público do servidor** e peça:

| Tipo | Nome | Valor |
|---|---|---|
| `A` | `codigof.com.br` (raiz, às vezes aparece como `@`) | `<IP_DO_SERVIDOR>` |
| `A` | `www` | `<IP_DO_SERVIDOR>` |

- **Remover** os registros `A`/`CNAME` antigos desses nomes que apontam para o Lovable.
- Se possível, baixar o TTL para 300 segundos um dia antes, para a troca propagar mais rápido.

Para saber se já propagou:

```sh
dig +short codigof.com.br
dig +short www.codigof.com.br
```

Os dois precisam responder o IP do servidor antes do próximo passo.

### 13. Ativar o HTTPS

Só depois que o domínio já aponta para o servidor (passo 12):

```sh
sudo certbot --nginx -d codigof.com.br -d www.codigof.com.br
```

Informe um e-mail e aceite os termos. Quando perguntar sobre redirecionar HTTP para HTTPS,
escolha **redirecionar**. A renovação do certificado é automática; para conferir:
`sudo certbot renew --dry-run`.

### 14. Conferência final

- [ ] `https://codigof.com.br` abre com cadeado
- [ ] `https://www.codigof.com.br` também abre
- [ ] `https://codigof.com.br/api/health` responde `{"status":"ok"}`
- [ ] Login com e-mail + 4 últimos dígitos do CPF de um usuário real funciona
- [ ] `https://codigof.com.br/admin` abre o painel para um administrador
- [ ] Quiz ao vivo: com duas janelas (admin + participante), a resposta aparece na hora
- [ ] Reiniciar o servidor (`sudo reboot`) e o site volta sozinho

### Dia da virada (troca do site antigo pelo novo)

O site antigo (Lovable) continua recebendo respostas até o DNS mudar. Para não perder dados:

1. **Antes:** siga os passos 1 a 11 com um backup de teste e valide tudo pelo IP.
2. **Combine um horário** sem evento ou quiz acontecendo.
3. **Quem tem acesso ao Supabase antigo** gera um backup novo, com os dados do momento (ver
   [Gerar um backup a partir do Supabase antigo](#gerar-um-backup-a-partir-do-supabase-antigo)),
   e envia ao SRE.
4. **SRE:** repete o passo 7 com o backup novo e reinicia o app (`sudo systemctl restart codigof`).
5. **DNS:** troca os registros (passo 12). Em seguida, **SRE** faz o passo 13.
6. Conferência final (passo 14).
7. Depois de alguns dias estável: remover o domínio do projeto no Lovable e desligar o projeto
   do Supabase.

---

## Operação do dia a dia

Comandos com `sudo` são rodados com o seu usuário; os do app, como `codigof` em
`/opt/codigof/app` (`sudo -iu codigof` e `cd /opt/codigof/app`).

| Tarefa | Comando |
|---|---|
| Ver se está rodando | `sudo systemctl status codigof` |
| Ver os logs do app | `sudo journalctl -u codigof -n 200 --no-pager` (ao vivo: `-f`) |
| Reiniciar o app | `sudo systemctl restart codigof` |
| Saúde da API e do banco | `curl http://localhost:3001/api/health` |
| Logs do nginx | `/var/log/nginx/error.log` e `access.log` |

### Atualizar para uma versão nova do código

```sh
sudo -iu codigof
cd /opt/codigof/app
git pull
npm ci
npm run db:migrate     # aplica mudanças no banco, se houver
npm run build
exit
sudo systemctl restart codigof
```

### Backup automático diário

Com o seu usuário, crie a pasta e agende um backup completo às 3h, mantendo 14 dias:

```sh
sudo mkdir -p /var/backups/codigof && sudo chown postgres:postgres /var/backups/codigof
sudo tee /etc/cron.d/codigof-backup > /dev/null <<'EOF'
0 3 * * * postgres pg_dump -Fc codigof > /var/backups/codigof/codigof-$(date +\%F).dump && find /var/backups/codigof -name '*.dump' -mtime +14 -delete
EOF
```

Recomendado: copiar essa pasta para fora do servidor (outro storage/bucket).

Para restaurar um desses backups no **mesmo** servidor:

```sh
sudo systemctl stop codigof
sudo -u postgres pg_restore --clean --if-exists -d codigof /var/backups/codigof/codigof-<DATA>.dump
sudo systemctl start codigof
```

Para levar os dados para **outro** servidor, use o par `npm run db:backup` (no servidor de
origem, gera um `.sql` em `server/.data/`) e `npm run db:restore` (no destino, passo 7).

---

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Site mostra **502 Bad Gateway** | app parado | `sudo systemctl status codigof` e os logs (`journalctl`) |
| `/api/health` responde **503** | PostgreSQL parado ou senha errada em `DATABASE_URL` | `sudo systemctl status postgresql`; conferir `server/.env` |
| Log diz `Variável de ambiente X não definida` | faltou a linha no `server/.env` | preencher e reiniciar |
| `db:migrate` falha com **autenticação falhou** | senha errada em `ADMIN_DATABASE_URL` | refazer o passo 4 e conferir o `.env` |
| `db:migrate` ou `db:restore` falha com **`\restrict`** ou "invalid command" | PostgreSQL diferente do 18 | instalar o `postgresql-18` (passo 2) |
| `npm run build` morre sem mensagem | pouca memória | usar 4 GB de RAM ou criar swap de 2 GB |
| Quizzes ao vivo não atualizam sozinhos | nginx sem as linhas de WebSocket | conferir o passo 10 e `sudo nginx -t` |
| Login responde "Muitas tentativas" | limite de 5 tentativas por minuto por IP | esperar 1 minuto (em rede corporativa todos saem pelo mesmo IP) |
| `certbot` falha | domínio ainda não aponta para o servidor | esperar a propagação (`dig +short codigof.com.br`) |

---

## Para desenvolvedores

Aplicação React (Vite + shadcn) originalmente criada no Lovable. Hoje roda **sem Supabase**:
um backend Node próprio (`server/`) sobre **PostgreSQL**.

### Arquitetura

```
navegador ──/api──▶ server/ (Express + WebSocket) ──▶ PostgreSQL
```

- **Frontend** (`src/`): `src/integrations/supabase/client.ts` é um cliente próprio com a mesma
  API do supabase-js (`from().select().eq()`, `auth`, `rpc`, `functions.invoke`, `channel`),
  falando com `/api`. As telas não precisaram mudar.
- **Backend** (`server/src/`):
  - `query.ts`: traduz as consultas para SQL parametrizado (como o PostgREST)
  - `db.ts`: cada requisição roda com a role `anon`/`authenticated` e as claims do JWT,
    então **as policies de RLS originais continuam valendo** (`auth.uid()` funciona igual)
  - `auth.ts`: login com JWT + refresh token; aceita os hashes bcrypt importados do Supabase
  - `functions.ts`: porte das antigas Edge Functions (`auth-with-cpf`, `reset-password`,
    `create-admin-user`, `tutorial-narration`, `users-api`)
  - `realtime.ts`: `postgres_changes` via triggers + `LISTEN/NOTIFY`, e broadcast, por WebSocket
  - `GET /api/health`: saúde da API e do banco
- **Banco**: `server/sql/00_bootstrap.sql` emula o necessário do Supabase (roles, schema `auth`,
  `auth.uid()`); o schema do app vem de `server/sql/schema.sql` (dump da produção).

### Primeira configuração local

Requisitos: Node 20+ e PostgreSQL 18 (com `psql`/`pg_dump` no PATH ou `PG_BIN_DIR` no `.env`).

```sh
npm install
cp server/.env.example server/.env   # e preencha (instruções no arquivo)
npm run db:migrate                   # cria o banco local e aplica o schema
npm run db:restore -- <backup.sql>   # carrega um backup (ou use db:import, abaixo)
```

### Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Vite (http://localhost:8080) + API (http://localhost:3001) |
| `npm run build` / `npm start` | gera `dist/` / sobe a API servindo o `dist/` na porta `PORT` |
| `npm run db:migrate` | cria o banco (se preciso) e aplica migrations novas |
| `npm run db:backup [-- arquivo.sql]` | exporta os dados (usuários + tabelas do app) |
| `npm run db:restore -- arquivo.sql` | apaga os dados atuais e carrega um backup |
| `npm run db:pull-schema` | extrai o schema do Supabase antigo para `server/sql/schema.sql` |
| `npm run db:import` | copia os dados do Supabase antigo para o banco local |

### Gerar um backup a partir do Supabase antigo

Enquanto o site antigo estiver no ar, os dados mais recentes estão no Supabase. Numa máquina
com o projeto configurado e `SOURCE_DATABASE_URL` preenchida no `server/.env`:

```sh
npm run db:import    # Supabase -> banco local
npm run db:backup    # banco local -> server/.data/codigof-backup-AAAA-MM-DD.sql
gzip -k server/.data/codigof-backup-*.sql
```

Envie o `.sql.gz` ao SRE por canal privado.

### Mudanças de schema

Crie um arquivo novo em `server/sql/migrations/` (ex.: `20261001120000_minha_mudanca.sql`) e rode
`npm run db:migrate`. Migrations já aplicadas ficam registradas em `_meta.migrations`.
Tabela nova que precise de realtime: `SELECT realtime.sync_triggers(ARRAY['nome_da_tabela']);`
(ou adicione-a à publicação `supabase_realtime` na migration).
