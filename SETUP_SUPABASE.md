# 🔐 Guia de Configuração do Supabase

Este guia vai ajudá-lo a configurar o Supabase para a autenticação de usuários em tempo real.

## 📋 Índice
1. [Criar Conta no Supabase](#criar-conta-no-supabase)
2. [Criar um Novo Projeto](#criar-um-novo-projeto)
3. [Configurar as Credenciais](#configurar-as-credenciais)
4. [Testar a Autenticação](#testar-a-autenticação)
5. [Solução de Problemas](#solução-de-problemas)

---

## 1. Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"Start your project"** ou **"Sign Up"**
3. Use seu email ou conta GitHub para criar a conta
4. Verifique seu email para confirmar
5. Faça login na sua conta Supabase

---

## 2. Criar um Novo Projeto

### Passo 1: Nova Organização (primeira vez)
Se for sua primeira vez, Supabase pedirá para criar uma organização:
1. Digite o nome da organização (ex: "Meu Projeto")
2. Clique em **"Create Organization"**

### Passo 2: Criar o Projeto
1. Clique em **"New Project"**
2. Digite o **nome do projeto** (ex: "notificacoes-tempo-real")
3. Configure a senha do banco de dados (use algo forte)
4. Escolha a **região** mais próxima a você
5. Clique em **"Create new project"**

⏳ O projeto levará alguns minutos para ser criado...

---

## 3. Configurar as Credenciais

### Passo 1: Copiar as Chaves

Após o projeto ser criado:

1. No menu à esquerda, clique em **"Settings"** (engrenagem ⚙️)
2. Clique em **"API"** no submenu
3. Você verá as seguintes chaves (não compartilhe!):

   - **Project URL**: `https://seu-projeto.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: (não usar no frontend!)

### Passo 2: Criar o Arquivo `.env`

1. Na raiz do projeto (`/workspaces/notifica-o_tempo_real/`), copie o arquivo `.env.example`:

```bash
cp .env.example .env
```

2. Abra o arquivo `.env` (ele já existe como template)

3. Preencha com suas chaves:

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key-aqui
SESSION_SECRET=
```

### Passo 3: Armazenar Credenciais no localStorage

Como estamos usando JavaScript no frontend, você precisa fazer isso **uma única vez** no console do navegador:

1. Abra a página de login: `http://localhost:3000/login.html`
2. Abra o DevTools (F12 ou Ctrl+Shift+I)
3. Vá para a aba **"Console"**
4. Cole o seguinte código (substitua com suas chaves):

```javascript
localStorage.setItem('supabase_url', 'https://seu-projeto.supabase.co');
localStorage.setItem('supabase_anon_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
```

5. Pressione Enter
6. Você verá: `undefined` (isso é normal)
7. Recarregue a página (F5)

✅ Pronto! As credenciais estão armazenadas.

---

## 4. Testar a Autenticação

### Teste 1: Criar uma Conta

1. Acesse `http://localhost:3000/signup.html`
2. Preencha o formulário:
   - **Nome Completo**: Seu Nome
   - **Email**: seu-email@exemplo.com
   - **Senha**: Uma@Senha@123! (mínimo 8 caracteres, 1 maiúscula, 1 número)
   - **Confirmar Senha**: A mesma senha
   - ✅ Aceitar Termos de Serviço
3. Clique em **"Criar Conta"**
4. Você receberá um email de confirmação

### Teste 2: Fazer Login

1. Após confirmar no email, acesse `http://localhost:3000/login.html`
2. Use as credenciais que acabou de criar
3. Clique em **"Entrar"**
4. ✅ Se tudo funcionou, você será redirecionado ao dashboard

### Teste 3: Recuperação de Senha

1. Acesse `http://localhost:3000/forgot-password.html`
2. Digite o email de sua conta
3. Clique em **"Enviar Link de Recuperação"**
4. Você receberá um email com um link
5. Clique no link do email
6. Você será redirecionado para redefinir sua senha
7. ✅ Defina uma nova senha

---

## 5. Solução de Problemas

### ❌ Erro: "Supabase não foi configurado corretamente"

**Causa**: As credenciais não estão no localStorage

**Solução**:
1. Abra o Console (F12)
2. Verifique se as credenciais foram armazenadas:
```javascript
console.log(localStorage.getItem('supabase_url'));
console.log(localStorage.getItem('supabase_anon_key'));
```

3. Se estiverem vazias, siga o **Passo 3** acima novamente

### ❌ Erro: "Email já registrado"

**Causa**: Essa conta já existe no Supabase

**Solução**:
- Use um email diferente, ou
- Delete a conta anterior no Supabase Dashboard:
  1. Vá para **Settings** → **Users** no seu projeto Supabase
  2. Encontre o usuário
  3. Clique em **"..."** e **"Delete"**

### ❌ Erro: "Email não pode ser vazio"

**Causa**: O formulário não validou corretamente

**Solução**:
- Verifique se todos os campos estão preenchidos
- Certifique-se de estar usando um email válido

### ❌ Erro: "As senhas não correspondem"

**Causa**: As duas senhas digitadas são diferentes

**Solução**:
- Digite a mesma senha em ambos os campos
- A senha deve ser idêntica em "Senha" e "Confirmar Senha"

### ❌ Erro: "Supabase library not loaded"

**Causa**: A biblioteca do Supabase não carregou corretamente

**Solução**:
1. Verifique se a página carregou completamente
2. No Console, teste:
```javascript
console.log(window.supabase);
```

3. Se retornar `undefined`, recarregue a página (Ctrl+Shift+R para cache limpo)

### ❌ Erro: "Network error" ou "Failed to fetch"

**Causa**: Problema de conexão com internet ou URL errada

**Solução**:
1. Verifique sua internet
2. Verifique se a URL do Supabase está correta (sem espaços)
3. Abra o Console e verifique se há outros erros

---

## 🔑 Chaves e Segurança

### 📌 IMPORTANTE: Proteja suas chaves!

- **Anon Key** (Chave Anônima):
  - ✅ SEGURO usar no frontend (JavaScript)
  - ✅ SEGURO enviar ao cliente
  - ❌ Não use para operações administrativas

- **Service Role Key**:
  - ❌ NUNCA use no frontend (JavaScript)
  - ✅ Use apenas no backend (Node.js/servidor)
  - 🔒 Mantenha segura em `.env`

- **URL do Projeto**:
  - ✅ SEGURO usar no frontend
  - É apenas o endereço do seu banco de dados

---

## 📚 Próximos Passos

Após configurar o Supabase:

1. **Integração com Notificações**: 
   - O sistema agora protege o dashboard
   - Cada usuário vê suas próprias notificações

2. **Admin Panel**:
   - Configure permissões para administradores
   - Use JWT tokens para validação

3. **Banco de Dados**:
   - Crie tabelas para armazenar notificações
   - Configure RLS (Row Level Security)

---

## 🆘 Precisa de Ajuda?

- **Documentação Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Dashboard Supabase**: [app.supabase.com](https://app.supabase.com)
- **GitHub Issues**: Abra uma issue no repositório

---

**Parabéns! 🎉 Você configurou o Supabase com sucesso!**
