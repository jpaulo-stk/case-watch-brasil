# Case Watch Brasil — Gerenciador de Tarefas

Aplicação **full-stack** de gerenciamento de tarefas com **colaboração entre usuários**,
categorias, acompanhamento de progresso em um **quadro Kanban** e relatórios simples.

Monorepo com dois pacotes:

- **`back-end/`** — API RESTful (Node.js + Express + TypeScript + PostgreSQL)
- **`front-end/`** — SPA (Vue 3 + Vite + Tailwind CSS)

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Modelo de dados](#modelo-de-dados)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar](#como-rodar)
  - [Back-end](#back-end)
  - [Front-end](#front-end)
  - [Docker](#docker)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Documentação da API](#documentação-da-api)
- [Exemplos de uso](#exemplos-de-uso)
- [Autenticação e controle de acesso](#autenticação-e-controle-de-acesso)
- [Testes](#testes)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Decisões técnicas](#decisões-técnicas)
- [Status e próximos passos](#status-e-próximos-passos)

---

## Funcionalidades

- **Contas de usuário** — cadastro, login (JWT) e edição de perfil.
- **Tarefas (CRUD)** — criar, editar, excluir e mover entre status.
- **Kanban** — 4 colunas (`Pendente`, `Em progresso`, `Revisão`, `Concluído`) com **drag-and-drop**; arrastar um card atualiza o status na API.
- **Categorias (CRUD)** — cada usuário tem suas próprias categorias (nome único por usuário).
- **Colaboração** — o dono adiciona colaboradores (por **email**) com papel **viewer** (só vê) ou **editor** (vê e edita). Tarefas compartilhadas aparecem no board do colaborador.
- **Relatórios** — contagem de tarefas por status.
- **Controle de acesso** — dono e colaborador têm permissões distintas, validadas no back-end.

---

## Stack

### Back-end
| Ferramenta | Uso |
|---|---|
| **Node.js + Express 5** | API RESTful (ESM + TypeScript) |
| **TypeORM** | ORM + migrations |
| **PostgreSQL 16** | banco relacional |
| **JWT** (`jsonwebtoken`) | autenticação |
| **bcrypt** | hash de senha |
| **Zod** + **@asteasolutions/zod-to-openapi** | validação de entrada **e** geração do OpenAPI (fonte única) |
| **Swagger UI** | documentação interativa em `/docs` |
| **Jest** + **ts-jest** | testes unitários |
| **tsx** | runtime de dev |

### Front-end
| Ferramenta | Uso |
|---|---|
| **Vue 3** (`<script setup>`) | UI |
| **Vite** | build/dev server |
| **TypeScript** | tipagem |
| **Tailwind CSS** | estilo (componentes reutilizáveis próprios) |
| **Pinia** | estado global (sessão/auth) |
| **Vue Router** | rotas + guard de autenticação |
| **axios** | cliente HTTP (interceptors de JWT e de 401) |
| **vuedraggable** | drag-and-drop do Kanban |
| **Zod** | validação de formulários |

---

## Arquitetura

O back-end segue uma **arquitetura em camadas**, com responsabilidades separadas:

```
routes → controllers → services (regra de negócio) → repositories → PostgreSQL
```

- **routes** — mapeiam URL/método e aplicam middlewares (`authenticate`, `validateBody`).
- **controllers** — leem `req`, chamam o service, escolhem o status HTTP.
- **services** — regra de negócio (hash de senha, unicidade, ownership, colaboração).
- **repositories** — acesso ao banco (TypeORM).
- **middlewares** — `authenticate` (JWT), `validateBody` (Zod), `errorHandler` (tratamento central de erros).

O `app.ts` (configuração do Express) é **separado** do `server.ts` (que sobe a porta),
o que deixa a aplicação **pronta para serverless** (AWS Lambda) e facilita os testes.

---

## Modelo de dados

```
users(id, name, email [único], password_hash, username [único], phone, is_active,
      created_at, updated_at, deleted_at)            -- soft delete

category(id, name, user_id → users, created_at, updated_at, deleted_at,
      UNIQUE(user_id, name))                         -- única por usuário

tasks(id, name, description, category_id → category,
      status enum('pending','in_progress','review','done') [default: pending],
      user_id → users [dono], deadline, created_at, updated_at, deleted_at)

user_has_tasks(user_id, task_id, role enum('viewer','editor'))   -- colaboração N:N, PK composta
```

- **Dono** da tarefa = `tasks.user_id`. **Colaboradores** = linhas em `user_has_tasks`.
- **Senha** nunca sai do banco: a coluna é `select: false` e só o login a carrega explicitamente.
- **Soft delete** (`deleted_at`) em users, category e tasks.

---

## Pré-requisitos

- **Node.js 22+**
- **Yarn 4** (o projeto usa `packageManager: yarn@4`; o Corepack ativa automaticamente)
- **Docker** (para o PostgreSQL) — ou um Postgres 16 local

---

## Como rodar

### Back-end

```bash
cd back-end

# 1. variáveis de ambiente (ver seção abaixo)
cp .env.example .env    # e preencha os valores

# 2. sobe o PostgreSQL via Docker
docker compose up -d

# 3. dependências
yarn install

# 4. cria o schema no banco
yarn migration:run

# 5. sobe a API (http://localhost:3000)
yarn dev
```

A API sobe em **http://localhost:3000** e a documentação em **http://localhost:3000/docs**.

### Front-end

```bash
cd front-end
yarn install
yarn dev        # http://localhost:5173
```

> O front espera a API em `http://localhost:3000`. O CORS já está liberado para `http://localhost:5173`.

**Fluxo de teste:** criar conta → criar uma **categoria** → criar uma **tarefa** (precisa de categoria) → arrastar os cards no board.

### Docker

Um único comando sobe **API + PostgreSQL** juntos (a API espera o banco ficar saudável, **roda as migrations** e sobe sozinha):

```bash
cd back-end
docker compose up -d --build
```

- API em **http://localhost:3000** (docs em `/docs`)
- Postgres na rede do compose (a API usa `DB_HOST=postgres`)

Requer o `back-end/.env` preenchido (o compose lê `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`).

> Para desenvolver com a API local (`yarn dev`) e só o Postgres no Docker:
> `docker compose up -d postgres`.

---

## Variáveis de ambiente

Arquivo `back-end/.env`:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DB_HOST` | host do Postgres | `localhost` |
| `DB_PORT` | porta | `5432` |
| `DB_USER` | usuário | `postgres` |
| `DB_PASSWORD` | senha | `sua_senha` |
| `DB_NAME` | banco | `case_watch` |
| `JWT_SECRET` | segredo para assinar o JWT | `uma_string_longa_aleatoria` |
| `PORT` | (opcional) porta da API | `3000` |

O `.env` está no `.gitignore` (não é versionado).

---

## Documentação da API

Documentação **OpenAPI/Swagger** interativa em **`/docs`** (com botão *Authorize* para o token JWT).
O schema é gerado a partir dos mesmos schemas Zod usados na validação — **fonte única de verdade**.

### Endpoints

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/auth/login` | Login → `{ token, user }` | — |
| `POST` | `/users` | Cadastro | — |
| `GET` | `/users/:id` | Buscar usuário | ✅ |
| `PUT` | `/users/:id` | Atualizar usuário | ✅ |
| `DELETE` | `/users/:id` | Remover (soft delete) | ✅ |
| `GET` | `/categories` | Categorias do usuário | ✅ |
| `POST` | `/categories` | Criar categoria | ✅ |
| `PUT` | `/categories/:id` | Editar categoria | ✅ |
| `DELETE` | `/categories/:id` | Remover categoria | ✅ |
| `GET` | `/tasks` | Tarefas (próprias + compartilhadas) | ✅ |
| `POST` | `/tasks` | Criar tarefa | ✅ |
| `GET` | `/tasks/:id` | Buscar tarefa | ✅ |
| `PATCH` | `/tasks/:id` | Editar tarefa | ✅ |
| `PATCH` | `/tasks/:id/status` | Mudar status (Kanban) | ✅ |
| `DELETE` | `/tasks/:id` | Remover tarefa (só dono) | ✅ |
| `POST` | `/tasks/:id/collaborators` | Adicionar colaborador (por email) | ✅ |
| `GET` | `/tasks/:id/collaborators` | Listar colaboradores | ✅ |
| `DELETE` | `/tasks/:id/collaborators/:userId` | Remover colaborador (só dono) | ✅ |

Rotas autenticadas exigem o header `Authorization: Bearer <token>`.

---

## Exemplos de uso

```bash
# 1. cadastro
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@ex.com","username":"joao","password":"secret123"}'

# 2. login (guarde o token)
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" \
  -d '{"email":"joao@ex.com","password":"secret123"}'

# 3. criar categoria (use o token)
curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"name":"Trabalho"}'

# 4. criar tarefa
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"name":"Estudar","description":"...","categoryId":1}'

# 5. mover no Kanban
curl -X PATCH http://localhost:3000/tasks/1/status \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'

# 6. adicionar colaborador (por email)
curl -X POST http://localhost:3000/tasks/1/collaborators \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"email":"maria@ex.com","role":"editor"}'
```

---

## Autenticação e controle de acesso

- **JWT** emitido no login (`expiresIn: 1h`), validado por um middleware que popula `req.user`.
- Erros de token (ausente/inválido/expirado) → **401**; no front, um interceptor de resposta **desloga** e volta ao login.
- **Ownership** e **papéis**:
  - **Dono** — tudo (editar, mudar status, excluir, gerenciar colaboradores).
  - **Colaborador `editor`** — ver e editar/mover a tarefa.
  - **Colaborador `viewer`** — apenas ver.
- A senha é hasheada com **bcrypt** e **nunca** retorna nas respostas.

---

## Testes

Testes unitários dos **services** (regra de negócio) com **Jest**, mockando os repositórios (sem tocar no banco):

```bash
cd back-end
yarn test              # roda os testes
yarn test --coverage   # com cobertura
```

Cobrem os caminhos felizes e os erros (400/401/403/404/409): unicidade, ownership,
permissões de colaborador (viewer × editor), validações, etc.

---

## Observabilidade

A API é instrumentada com **OpenTelemetry** (auto-instrumentação de Express, HTTP e Postgres),
exportando os traces para o **Jaeger** via OTLP.

```bash
# 1. sobe o Jaeger (já incluso no docker-compose)
docker compose up -d jaeger

# 2. sobe a API com tracing
yarn dev:otel

# 3. gere requisições e veja os traces na UI do Jaeger:
#    http://localhost:16686  (serviço "case-watch-api")
```

Cada requisição vira um **trace** com a árvore de spans — da rota HTTP até as queries no
banco — com a duração de cada etapa (ótimo para achar gargalos).

---

## Estrutura de pastas

```
back-end/src/
├─ config/         # data-source (TypeORM), openapi
├─ controllers/    # camada HTTP
├─ services/       # regra de negócio
├─ repositories/   # acesso ao banco
├─ entities/       # entidades TypeORM
├─ schemas/        # schemas Zod (validação + OpenAPI)
├─ middlewares/    # authenticate, validateBody, errorHandler
├─ errors/         # classes de erro HTTP (Conflict, NotFound, ...)
├─ migrations/     # migrations do banco
├─ app.ts          # configuração do Express
└─ server.ts       # entry point (sobe a porta)

front-end/src/
├─ views/          # telas (login, board, categorias, relatórios)
├─ components/      # base/ (reutilizáveis) + kanban/
├─ services/        # cliente da API (axios)
├─ stores/          # Pinia (auth)
├─ router/          # rotas + guard
├─ schemas/         # schemas Zod dos formulários
└─ utils/           # validação, máscara, labels
```

---

## Decisões técnicas

- **Zod como fonte única** — o mesmo schema valida o request **e** gera o OpenAPI, evitando divergência entre validação e documentação.
- **`app.ts` separado do `server.ts`** — deixa a API pronta para **serverless** (Lambda) e para testes com Supertest.
- **Colaborador por email (não por ID)** — decisão de **privacidade**: não se lista/expõe todos os usuários; convida-se por email (padrão de apps como Google Docs/Trello).
- **`select: false` na senha** — o hash nunca é carregado por padrão, nem via relações; só o login o pede explicitamente.
- **Soft delete** — nada é apagado de fato (`deleted_at`), preservando histórico.
- **Componentes reutilizáveis** — `BaseButton`, `BaseInput`, `BaseModal`, `TaskCard`, `KanbanColumn`.

---

## Status e próximos passos

**Implementado:** CRUD completo, autenticação JWT + controle de acesso, colaboração com papéis,
validação (Zod), documentação OpenAPI/Swagger, testes unitários (Jest), **observabilidade**
(OpenTelemetry + Jaeger), **Docker** (`docker compose up` sobe API + Postgres + Jaeger),
front-end em Vue + Tailwind.

**Planejado (próximos passos):**
- Deploy em **AWS Lambda** (a arquitetura já está preparada — `app.ts` desacoplado).
- **CI** (GitHub Actions) rodando testes e type-check a cada push.
