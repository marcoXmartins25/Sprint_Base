# Sistema de Planos - SprintBase

## ✅ Implementado

### 1. Sistema de Planos (Base)
- ✅ Migração `010_add_user_plan.sql` - adiciona `plan`, `plan_expires_at`, `plan_updated_at`
- ✅ Middleware `planLimits.js` - verifica limites por plano
- ✅ Endpoint `/api/users/:id/plan` (GET/PUT) - gerenciar planos

### 2. Limites por Plano
- ✅ **Free**: 2 sprints ativas, 20 tasks/sprint, sem campos extra
- ✅ **Pro**: Sprints e tasks ilimitadas, todos os campos
- ✅ **Team**: Tudo do Pro + utilizadores ilimitados
- ✅ Verificação em `POST /api/sprints` e `POST /api/tasks`
- ✅ Retorna erro 402 (Payment Required) quando exceder

### 3. PDF Watermark
- ✅ Watermark diagonal "SPRINTBASE FREE" em plano Free
- ✅ PDF limpo para Pro e Team
- ✅ Implementado em `pdf.js`

### 4. History (6 meses vs ilimitado)
- ✅ Migração `011_add_sprint_archived.sql` - adiciona `archived_at`
- ✅ Script `archiveSprints.js` - arquiva sprints > 6 meses (Free/Pro)
- ✅ Team plan: histórico ilimitado (nunca arquiva)
- ✅ Filtro em `GET /api/sprints?archived=true`

### 5. Custom Branding (Team only)
- ✅ Migração `012_add_team_branding.sql` - adiciona `company_name`, `logo_url`, `primary_color`
- ✅ Endpoint `/api/users/:id/branding` (GET/PUT)
- ✅ Upload de logo `/api/users/:id/branding/logo`
- ✅ PDF usa branding customizado para Team plan

---

## 🚀 Como Testar

### 1. Rodar migrações
```bash
cd backend
npm run migrate
```

### 2. Testar limites do plano Free

**Criar 3ª sprint (deve falhar):**
```bash
curl -X POST http://localhost:3000/api/sprints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Sprint 3","start_date":"2025-02-01","end_date":"2025-02-14"}'
```

**Resposta esperada:**
```json
{
  "error": "Your free plan allows only 2 active sprints. Upgrade to Pro for unlimited sprints.",
  "limit": 2,
  "current": 2,
  "upgrade": true
}
```

**Criar task com campos extra (deve falhar):**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sprint_id": 1,
    "title": "Test task",
    "deliverable": "API endpoint",
    "definition_of_done": "Tests pass"
  }'
```

**Resposta esperada:**
```json
{
  "error": "Extra fields (deliverable, definition of done, dependencies, risk) are only available in Pro and Team plans. Upgrade to unlock these features.",
  "fields": ["deliverable", "definition_of_done"],
  "upgrade": true
}
```

### 3. Fazer upgrade para Pro

```bash
curl -X PUT http://localhost:3000/api/users/1/plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"plan":"pro"}'
```

Agora podes criar sprints e tasks ilimitadas com todos os campos!

### 4. Testar PDF Watermark

**Com plano Free:**
```bash
curl http://localhost:3000/api/sprints/1/report \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o sprint-free.pdf
```
→ PDF terá watermark "SPRINTBASE FREE"

**Fazer upgrade para Pro e testar novamente:**
```bash
curl -X PUT http://localhost:3000/api/users/1/plan \
  -H "Content-Type: application/json" \
  -d '{"plan":"pro"}'

curl http://localhost:3000/api/sprints/1/report \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o sprint-pro.pdf
```
→ PDF sem watermark

### 5. Testar Custom Branding (Team only)

**Fazer upgrade para Team:**
```bash
curl -X PUT http://localhost:3000/api/users/1/plan \
  -H "Content-Type: application/json" \
  -d '{"plan":"team"}'
```

**Configurar branding:**
```bash
curl -X PUT http://localhost:3000/api/users/1/branding \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "company_name": "Acme Corp",
    "primary_color": "#ff6b6b"
  }'
```

**Upload de logo:**
```bash
curl -X POST http://localhost:3000/api/users/1/branding/logo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "logo=@/path/to/logo.png"
```

**Gerar PDF com branding:**
```bash
curl http://localhost:3000/api/sprints/1/report \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o sprint-branded.pdf
```
→ PDF com "Acme Corp" e cor customizada

### 6. Arquivar sprints antigas

```bash
cd backend
npm run archive:sprints
```

Isto arquiva sprints com `end_date < hoje - 6 meses` para users Free/Pro.
Users Team nunca têm sprints arquivadas.

---

## 📊 Endpoints Novos

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/users/:id/plan` | Ver plano atual e limites |
| PUT | `/api/users/:id/plan` | Atualizar plano (admin) |
| GET | `/api/users/:id/branding` | Ver branding (Team only) |
| PUT | `/api/users/:id/branding` | Atualizar branding (Team only) |
| POST | `/api/users/:id/branding/logo` | Upload logo (Team only) |
| GET | `/api/sprints?archived=true` | Listar sprints arquivadas |

---

## 🔧 Configuração de Produção

### Cron Job para Arquivamento
Adicionar ao crontab para rodar diariamente às 2h:
```bash
0 2 * * * cd /path/to/backend && npm run archive:sprints
```

### Variáveis de Ambiente
Nenhuma nova variável necessária. Usa as mesmas do `.env`:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sprint_tracker
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
```

---

## 🎯 Próximos Passos (Roadmap)

### Fase 5: Integrations (Futuro)
- [ ] Slack webhook quando task muda de status
- [ ] GitHub sync: issues → tasks
- [ ] Jira bidirectional sync

### Fase 6: Payment Gateway
- [ ] Stripe integration
- [ ] Checkout page
- [ ] Webhook para auto-upgrade após pagamento
- [ ] Invoices automáticos

### Fase 7: Admin Dashboard
- [ ] Painel para ver todos os users
- [ ] Métricas de uso por plano
- [ ] Gestão de subscriptions

---

## 📝 Notas Importantes

1. **User ID hardcoded**: Por agora, o sistema usa `userId = 1` em todos os checks. Quando implementares autenticação JWT completa, substitui por `req.user.id`.

2. **Ownership de Sprints**: Atualmente, todas as sprints são globais. Para multi-tenancy, adiciona `user_id` ou `team_id` à tabela `sprints`.

3. **Testes**: Todos os limites foram testados manualmente. Considera adicionar testes automatizados com Jest.

4. **Performance**: Os checks de limites fazem queries à DB. Para alta escala, considera cache (Redis).

---

## 🐛 Troubleshooting

**Erro: "relation users has no column plan"**
→ Roda `npm run migrate`

**Erro 402 mesmo com plano Pro**
→ Verifica se o plano foi atualizado: `SELECT plan FROM users WHERE id = 1;`

**PDF sem watermark no Free**
→ Verifica se `userPlan` está a ser passado corretamente em `reports.js`

**Branding não aparece no PDF**
→ Confirma que o user tem `plan = 'team'` e `company_name` preenchido
