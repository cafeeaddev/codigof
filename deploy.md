# Deploy — o que enviar ao SRE e como fazer a virada

Última atualização: 2026-09-28

O passo a passo técnico completo, para o SRE, está no **README**, na seção
"Colocar o sistema no ar (guia para SRE)". Este arquivo é o checklist do nosso lado.

## 1. Enviar ao SRE

- [ ] **Convite no GitHub:** repositório `github.com/cafeeaddev/codigof`, permissão de leitura.
- [ ] **Link do README**, pedindo para seguir a partir de "Colocar o sistema no ar".
- [ ] **Backup dos dados**, por canal privado: `server/.data/codigof-backup-2026-09-28.sql.gz`
  (1 MB, dados de 28/09/2026 às 13h52).
  Contém nomes, e-mails, CPFs e hashes de senha: nunca por e-mail aberto, repositório ou pasta
  pública.
- [ ] **Variáveis de ambiente**, por canal privado:

| Variável | O que mandar |
|---|---|
| `JWT_SECRET` | um segredo **novo** (não precisa ser o da máquina local). Gerar com `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `OPENAI_API_KEY` | chave da OpenAI (sem ela só a narração do tutorial não funciona) |
| `USERS_API_TOKEN` | só se alguém usa a API externa de usuários |

As senhas do banco (`DATABASE_URL` e `ADMIN_DATABASE_URL`) o próprio SRE cria; o README explica.
`SOURCE_DATABASE_URL` **não** vai para produção.

## 2. O que o SRE devolve

- [ ] **IP público do servidor** (fixo).
- [ ] Confirmação de que o site abre pelo IP e que `/api/health` responde `{"status":"ok"}`.

## 3. Validar antes da virada

Com o site no ar pelo IP (ainda com o backup de 28/09):

- [ ] Login com e-mail + 4 últimos dígitos do CPF.
- [ ] Painel `/admin` com um administrador (credenciais passadas em privado).
- [ ] Quiz ao vivo com duas janelas (admin + participante): a resposta aparece na hora.

## 4. Apontar o domínio

Hoje **codigof.com.br aponta para o Lovable**. A troca é feita por quem administra o DNS do
domínio (Registro.br ou provedor de DNS), não pelo SRE no servidor.

| Tipo | Nome | Valor |
|---|---|---|
| `A` | `codigof.com.br` (raiz / `@`) | IP do servidor |
| `A` | `www` | IP do servidor |

- Remover os registros `A`/`CNAME` antigos desses nomes que apontam para o Lovable.
- Um dia antes, baixar o TTL para 300 segundos, para a troca propagar rápido.
- O HTTPS (certbot) só funciona **depois** que o DNS propagar.

## 5. Dia da virada

O site antigo continua recebendo respostas até o DNS mudar. Para não perder dados:

1. Combinar um horário sem evento ou quiz acontecendo.
2. **Nós:** gerar um backup novo da produção antiga. Com `SOURCE_DATABASE_URL` preenchida no
   `server/.env`:
   ```sh
   npm run db:import
   npm run db:backup
   gzip -k server/.data/codigof-backup-*.sql
   ```
   Enviar o `.sql.gz` novo ao SRE, por canal privado.
3. **SRE:** carregar o backup novo (passo 7 do README) e reiniciar o app.
4. **DNS:** trocar os registros (seção 4 acima).
5. **SRE:** ativar o HTTPS (passo 13 do README).
6. Refazer a validação da seção 3 em `https://codigof.com.br`.
7. Depois de alguns dias estável: remover o domínio do projeto no Lovable e desligar o projeto
   do Supabase. Trocar a senha do banco do Supabase, que foi usada para a cópia.
