# Configuração de Email - SprintBase (Resend)

## 📧 Como Configurar o Resend

### 1. Criar conta no Resend

1. Vai para: https://resend.com
2. Cria uma conta gratuita
3. Verifica o teu email

### 2. Obter API Key

1. No dashboard do Resend, vai para **API Keys**
2. Clica em **Create API Key**
3. Nome: `SprintBase`
4. Permissões: **Sending access**
5. Copia a API Key (começa com `re_`)

### 3. Configurar `.env`

Adiciona ao ficheiro `backend/.env`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=SprintBase <onboarding@resend.dev>
APP_URL=http://localhost:5173
```

**Notas:**
- Para testes, usa `onboarding@resend.dev` (domínio de teste do Resend)
- Para produção, adiciona o teu domínio no Resend e usa `noreply@teu-dominio.com`

---

## 🚀 Instalar Dependências

```powershell
cd backend
npm install resend
```

---

## 🧪 Testar Envio de Email

### Via API:
```powershell
echo '{"email":"teu-email@gmail.com","password":"senha123","name":"Teste User"}' > user.json
curl.exe -X POST http://localhost:3000/api/test/users -H "Content-Type: application/json" -d "@user.json"
```

### Via Frontend:
1. Faz login como admin (`admin@admin.com` / `Senha123!`)
2. Vai para `/app/admin`
3. Clica **"+ Create User"**
4. Preenche os dados
5. Clica **"Create User"**

Verifica:
- Console do backend: `✅ Welcome email sent to: ...`
- Teu inbox (ou spam)

---

## 📝 Template do Email

O email enviado inclui:
- ✅ Design profissional e responsivo
- ✅ Credenciais de login (email + password)
- ✅ Botão direto para login
- ✅ Lista de features do SprintBase
- ✅ Aviso para mudar password
- ✅ Footer com copyright

---

## 🌐 Adicionar Domínio Próprio (Produção)

### 1. No Resend Dashboard:
1. Vai para **Domains**
2. Clica **Add Domain**
3. Adiciona `teu-dominio.com`
4. Copia os registos DNS (SPF, DKIM, DMARC)

### 2. No teu DNS Provider:
Adiciona os registos fornecidos pelo Resend

### 3. Verifica no Resend:
Aguarda verificação (pode demorar até 48h)

### 4. Atualiza `.env`:
```env
EMAIL_FROM=SprintBase <noreply@teu-dominio.com>
```

---

## 📊 Limites do Plano Gratuito

| Feature | Free Plan |
|---|---|
| Emails/mês | 3,000 |
| Emails/dia | 100 |
| Domínios | 1 |
| API Keys | Ilimitadas |

Para mais: https://resend.com/pricing

---

## 🐛 Troubleshooting

**Erro: "Missing API key"**
- Verifica se `RESEND_API_KEY` está no `.env`
- Reinicia o servidor após alterar `.env`

**Email não chega:**
- Verifica spam/junk folder
- Confirma que a API Key está ativa no Resend
- Verifica logs no Resend Dashboard → Emails

**Erro: "Invalid from address"**
- Para testes, usa `onboarding@resend.dev`
- Para produção, adiciona e verifica o teu domínio primeiro

**Rate limit exceeded:**
- Plano gratuito: 100 emails/dia
- Aguarda 24h ou faz upgrade

---

## 🎯 Vantagens do Resend

✅ **Setup super rápido** - Apenas API Key, sem SMTP
✅ **99.9% deliverability** - Emails chegam sempre
✅ **Dashboard com analytics** - Vê opens, clicks, bounces
✅ **Webhooks** - Recebe eventos em tempo real
✅ **Plano gratuito generoso** - 3,000 emails/mês
✅ **Suporte a React Email** - Templates em JSX (opcional)

---

## 📧 Exemplo de Email Recebido

```
De: SprintBase <onboarding@resend.dev>
Para: user@example.com
Assunto: 🚀 Welcome to SprintBase - Your Account Details

[Design bonito com gradiente roxo]

🔐 Your Login Credentials
Email: user@example.com
Password: senha123

⚠️ Important: Please change your password after your first login

[Botão: Sign In to SprintBase →]

What you can do with SprintBase:
✓ Create and manage sprints
✓ Track tasks with priorities and hours
...
```

---

## 🔗 Links Úteis

- Dashboard: https://resend.com/dashboard
- Docs: https://resend.com/docs
- Status: https://resend.com/status
- Pricing: https://resend.com/pricing
