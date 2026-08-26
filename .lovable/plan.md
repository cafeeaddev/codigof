# Guia de Exportação e Execução Local

## Objetivo
Permitir rodar o projeto localmente para testes, sem depender do preview/publicação do Lovable.

## O que você precisa
- **Node.js** (versão recomendada: 18 ou superior)
- **npm** (já vem com o Node.js)
- Git (opcional, mas recomendado para clonar)

## Passo a passo

### 1. Exportar / obter o código

**Opção A — clone via Git (recomendada)**
No Lovable, copie o Git URL do projeto e rode no terminal:

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DA_PASTA>
```

**Opção B — download ZIP**
Se preferir, faça download do repositório em formato ZIP e extraia em uma pasta local.

### 2. Instalar dependências

Dentro da pasta do projeto, execute:

```bash
npm install
```

Isso instala React 18, Vite, Tailwind CSS, shadcn/ui, Supabase, Three.js e demais bibliotecas listadas no `package.json`.

### 3. Verificar variáveis de ambiente

O arquivo `.env` já está presente na raiz do projeto com as credenciais do Supabase:

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

**Atenção:** estas chaves apontam para o Supabase externo do projeto (`rbjfnuzbrotruqpoermr`). Para testes locais, os dados lidos/escritos vão para esse banco real. Se quiser isolar testes, é necessário apontar para outro projeto Supabase.

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O Vite sobe o app em `http://localhost:8080` por padrão. Acesse pelo navegador.

### 5. Fazer build de produção (opcional)

```bash
npm run build
```

Gera os arquivos estáticos na pasta `dist/`, prontos para hospedar em qual servidor estático.

### 6. Rodar preview do build (opcional)

```bash
npm run preview
```

Serve a versão de produção localmente para validar.

## Estrutura do projeto

```text
/
├── public/                # Imagens, ícones e assets estáticos
├── src/
│   ├── components/        # Componentes React (UI, quizzes, admin)
│   ├── contexts/          # Contextos (ex: AuthContext)
│   ├── hooks/             # Custom hooks
│   ├── integrations/      # Cliente Supabase e tipos gerados
│   ├── lib/               # Funções utilitárias
│   ├── pages/             # Páginas principais (Index, Admin, etc.)
│   ├── utils/             # Utilitários de jogo, XP, relatórios
│   ├── App.tsx            # Rotas principais
│   ├── main.tsx           # Ponto de entrada React
│   └── index.css          # Estilos globais e tokens de design
├── supabase/              # Configurações e Edge Functions do Supabase
├── index.html             # HTML principal
├── package.json           # Dependências e scripts
├── vite.config.ts         # Configuração do Vite
└── tailwind.config.ts     # Configuração do Tailwind
```

## Principais tecnologias
- **Vite 5** — build e dev server
- **React 18 + TypeScript** — interface
- **Tailwind CSS v3 + shadcn/ui** — estilização e componentes
- **React Router DOM** — navegação
- **Supabase** — backend (auth, banco de dados, real-time)
- **@tanstack/react-query** — cache de dados
- **Three.js / @react-three/fiber** — cena vaporwave 3D

## Observações importantes
- O projeto é um **SPA (Single Page Application)** client-side; não possui backend próprio rodando localmente.
- Funcionalidades de login, quizzes, rankings e admin dependem do Supabase configurado.
- Não é necessário subir nenhum servidor Node.js/Express local; o Vite apenas serve o front-end.
- Se o Supabase estiver no plano Free e inativo por mais de 7 dias, o projeto pode ser pausado pelo Supabase — isso afeta testes locais também.
