# MVP de Sistema de Notificação em Tempo Real 🚀

> Baseado no desafio apresentado no vídeo da **Codecon** - Implementação prática de um sistema de notificações com JavaScript puro.

## 📋 Requisitos Implementados

### ✅ Obrigatórios
- [x] **Página Web**: Onde o usuário comum pode ver as suas notificações
- [x] **Painel Admin**: Uma área para enviar notificações para um ou mais usuários
- [x] **Tempo Real**: As notificações devem aparecer instantaneamente na tela do usuário (via Socket.io WebSocket)
- [x] **Marcar como lida**: O usuário pode clicar na notificação e mudar o status dela

### 🎁 Bônus Implementados
- [x] **Contador de notificações não lidas** - Badge dinâmico atualizado em tempo real
- [x] **Som ao receber notificação** - Alerta sonoro (com fallback gracioso)
- [x] **Animações** - Transições suaves e animações de entrada
- [x] **Histórico de notificações** - Todas as notificações são mantidas em memória
- [x] **Suporte a múltiplos usuários simultâneos** - Cada usuário tem seu próprio ID
- [x] **Broadcast ou Targeted** - Enviar para todos ou para um usuário específico
- [x] **Design Responsivo** - Funciona em mobile, tablet e desktop
- [x] **Log de Enviamentos** - Painel Admin mostra histórico de mensagens enviadas
- [x] **Notificações Nativas** - Integração com Notification API do navegador
- [x] **Sincronização ao Reconectar** - Carrega histórico ao se conectar

## 🏗️ Arquitetura do Projeto

```
notifica-o_tempo_real/
├── server.js                 # Backend (Node.js + Express + Socket.io)
├── package.json              # Dependências do projeto
├── public/
│   ├── index.html           # Página do usuário (painel de notificações)
│   ├── admin.html           # Painel do administrador
│   ├── client.js            # Lógica do lado do cliente (WebSocket)
│   ├── admin.js             # Lógica do painel admin
│   └── style.css            # Estilos compartilhados
└── README.md                # Este arquivo
```

## 🛠️ Stack Utilizado

- **Backend**: Node.js com Express.js
- **Comunicação em Tempo Real**: Socket.io (WebSocket)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Banco de Dados**: Em memória (arrays/objetos) para MVP

## 🚀 Como Usar

### Requisitos
- Node.js 14+ instalado
- npm

### Instalação

```bash
# Clone ou navegue até o diretório do projeto
cd /workspaces/notifica-o_tempo_real

# Instale as dependências
npm install
```

### Executar

```bash
npm start
```

O servidor iniciará em: **http://localhost:3000**

### Acessar as Páginas

1. **Painel do Usuário** (para receber notificações):
   ```
   http://localhost:3000/
   ```

2. **Painel do Administrador** (para enviar notificações):
   ```
   http://localhost:3000/admin.html
   ```

## 📝 Como Testar

1. **Abra o painel do usuário** em uma ou mais abas/navegadores diferentes
2. Note o **ID único** de cada usuário na parte superior
3. **Abra o painel admin** em outra aba
4. Envie uma notificação:
   - **Option A**: Deixe o campo de usuário vazio para fazer **broadcast** (enviar para todos)
   - **Option B**: Digite um ID específico (ex: `user1234`) para enviar para aquele usuário
5. Veja a notificação aparecer **instantaneamente** no painel do usuário
6. **Clique na notificação** para marcar como lida

## 📊 Recursos Principais

### Painel do Usuário
- ✅ Recebe notificações em tempo real
- ✅ Marca notificações como lidas ao clicar
- ✅ Contador de notificações não lidas com badge vermelho
- ✅ Som ao receber notificação
- ✅ Notificações nativas do navegador (se permitido)
- ✅ Histórico completo de todas as notificações
- ✅ Status de conexão com indicador visual
- ✅ Botão para limpar histórico

### Painel Admin
- ✅ Formulário para enviar notificações
- ✅ Campos: Título, Mensagem, Usuário Alvo
- ✅ Contador de caracteres na mensagem
- ✅ Feedback visual de envio bem-sucedido
- ✅ Log de todas as notificações enviadas
- ✅ Estatísticas (notificações enviadas, usuários online)
- ✅ Suporte a broadcast ou envio direcionado

## 🔄 Fluxo em Tempo Real

```
┌──────────────┐         HTTP POST        ┌─────────────┐
│  Admin Panel │ ──────────────────────→ │ Server/API  │
└──────────────┘                          └──────┬──────┘
                                                 │
                                    Socket.io Broadcast/Send
                                                 │
                    ┌────────────────────────────┴────────────────────┐
                    ↓                                                  ↓
            ┌──────────────┐                                  ┌──────────────┐
            │ User Panel 1 │ ◄────────── Notificação ────→  │ User Panel 2 │
            └──────────────┘          Em Tempo Real          └──────────────┘
```

## 🎨 Funcionalidades de UI/UX

- **Design Moderno**: Gradiente azul no header, ícones emoji, espaçamento generoso
- **Animações**: Slide-down ao receber notificação, pulse no indicator
- **Responsivo**: CSS Grid adaptável, mobile-first
- **Acessibilidade**: Cores de contraste adequado, labels descritivos
- **Feedback Visual**: Badges, status indicators, animações

## 💾 Persistência de Dados

Atualmente, o MVP usa **armazenamento em memória**. Para produção, substitua por:

- **PostgreSQL** + Sequelize/TypeORM
- **MongoDB** + Mongoose
- **Supabase** (como mencionado no vídeo)
- **Firebase Firestore**

## 🔐 Notas de Segurança para Produção

- ⚠️ Adicionar autenticação (JWT, OAuth2)
- ⚠️ Validação e sanitização de entrada
- ⚠️ Rate limiting
- ⚠️ HTTPS/WSS em produção
- ⚠️ CORS configurado adequadamente

## 🚀 Próximos Passos (Melhorias Futuras)

- [ ] Banco de dados persistente
- [ ] Autenticação de usuários
- [ ] Categorias/Canais de notificações
- [ ] Preferências do usuário (som, tipo de notificação)
- [ ] Dashboard de analytics
- [ ] Fila de mensagens (RabbitMQ, Redis)
- [ ] Docker containerization
- [ ] Testes unitários e E2E

## 📚 Referências

- [Socket.io Documentation](https://socket.io/)
- [Express.js Guide](https://expressjs.com/)
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Codecon Challenge](https://www.youtube.com/watch?v=...)

## 📄 Licença

MIT - Veja LICENSE para detalhes

---

**Desenvolvido como MVP prático para aprendizado de sistemas em tempo real com JavaScript** 🎓
