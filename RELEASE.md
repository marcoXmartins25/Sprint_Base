# Sprint Base — Release v1.0.0

**Data de lançamento:** Maio 2025

---

## O que é o Sprint Base?

Sprint Base é uma aplicação web de gestão de sprints e tarefas, pensada para equipas de desenvolvimento que querem uma ferramenta simples, rápida e sem ruído. Permite criar sprints, gerir tarefas com prioridades e estados, atribuir membros da equipa e exportar relatórios em PDF.

---

## Stack Tecnológica

| Camada     | Tecnologia                              |
|------------|-----------------------------------------|
| Frontend   | React 18, React Router v6, Tailwind CSS, Vite |
| Backend    | Node.js, Express                        |
| Base de dados | PostgreSQL                           |
| Auth       | JWT (jsonwebtoken) + bcryptjs           |
| PDF        | PDFKit                                  |
| Upload     | Multer                                  |

---

## Funcionalidades desta versão

### Autenticação
- Login com email e password
- Tokens JWT com expiração de 7 dias
- Verificação de sessão automática

### Sprints
- Criar, editar e eliminar sprints
- Visualização ordenada: sprint ativa em primeiro, depois futuras, depois passadas
- Dashboard com cards por sprint

### Tarefas
- Criar tarefas dentro de um sprint com título, descrição, prioridade, estado, datas e horas estimadas
- Edição inline diretamente na tabela (título, prioridade, estado, datas, horas)
- Atribuição de tarefas a membros da equipa com avatar
- Filtros por estado: All / To Do / In Progress / Done
- Barra de progresso calculada por sprint
- Estatísticas por sprint: total, to-do, in progress, done, horas

### Relatórios
- Exportação de relatório PDF por sprint com lista de tarefas

### Perfil de utilizador
- Edição de nome e email
- Upload de foto de perfil (máx. 2MB)
- Avatar com iniciais como fallback

---

## Base de dados — Migrações incluídas

| Ficheiro | Descrição |
|----------|-----------|
| `001_create_sprints.sql` | Tabela de sprints |
| `002_create_tasks.sql` | Tabela de tarefas com FK para sprints |
| `003_create_users.sql` | Tabela de utilizadores |
| `004_add_task_fields.sql` | Campos adicionais nas tarefas |
| `005_add_user_profile.sql` | Campos de perfil no utilizador |
| `006_add_avatar_url.sql` | Campo avatar_url |
| `007_remove_task_columns.sql` | Limpeza de colunas obsoletas |
| `008_add_task_hours.sql` | Campo de horas estimadas por tarefa |

---

## Como instalar e correr

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
cp .env.example .env
# Preenche as variáveis no .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET)
npm install
npm run db:setup   # cria tabelas e seed inicial
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:5173` e a API em `http://localhost:3000`.

---

## Variáveis de ambiente (backend)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=<db_user>
DB_PASSWORD=<db_password>
DB_NAME=<db_name>
JWT_SECRET=<secret_key>
```

---

## Estrutura do projeto

```
Sprint_Base/
├── backend/
│   ├── migrations/       # SQL de criação e alteração de tabelas
│   ├── scripts/          # migrate.js e seed.js
│   ├── seeders/          # Dados iniciais (utilizadores)
│   └── src/
│       ├── routes/       # auth, sprints, tasks, reports
│       ├── db.js         # Ligação ao PostgreSQL
│       ├── index.js      # Entry point Express
│       └── pdf.js        # Geração de relatórios PDF
└── frontend/
    └── src/
        ├── components/   # AppLayout, SprintCard, TaskForm, Avatar, Logo
        └── pages/        # Dashboard, SprintDetail, Profile, Login, Landing, Docs
```

---

## API — Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/verify` | Verificar token |
| GET | `/api/sprints` | Listar sprints |
| POST | `/api/sprints` | Criar sprint |
| PUT | `/api/sprints/:id` | Editar sprint |
| DELETE | `/api/sprints/:id` | Eliminar sprint |
| GET | `/api/sprints/:id/tasks` | Tarefas de um sprint |
| GET | `/api/sprints/:id/report` | Download PDF |
| POST | `/api/tasks` | Criar tarefa |
| PUT | `/api/tasks/:id` | Editar tarefa |
| DELETE | `/api/tasks/:id` | Eliminar tarefa |
| GET | `/api/users` | Listar utilizadores |
| PUT | `/api/users/:id` | Editar utilizador |
| POST | `/api/users/:id/avatar` | Upload de avatar |

---

## Notas

- Os ficheiros de upload (avatares) são servidos em `/uploads/:file` e requerem autenticação
- O seed inicial cria utilizadores de exemplo definidos em `seeders/001_users.js`
- O campo `hours` nas tarefas aceita valores decimais (ex: `1.5` para 1h30)
