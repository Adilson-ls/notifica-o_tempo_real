require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const supabase = require('./supabase-client');

// Admin client (service role) - usado para operações administrativas
const adminSupabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    } 
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==== "Banco de dados" em memória para o MVP ====
let notifications = [];
let users = {}; // Mapeamento: userId -> socketId
let notifIdCounter = 1;

// ==== ROTAS HTTP ====

// Rota Admin: Enviar notificação
// Middleware: verifica token Supabase (Bearer)
async function verifyToken(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'Unauthorized' });
        const token = auth.split(' ')[1];

        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data?.user) return res.status(401).json({ success: false, error: 'Invalid token' });

        req.user = data.user;
        next();
    } catch (err) {
        console.error('verifyToken error', err.message || err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
}

// Middleware: verifica se é admin (opcional, usa ADMIN_EMAIL env)
function verifyAdmin(req, res, next) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return next(); // se não configurado, não bloqueia
    if (req.user && req.user.email === adminEmail) return next();
    return res.status(403).json({ success: false, error: 'Forbidden: admin only' });
}

// Rota Admin: Enviar notificação (protegida)
app.post('/api/notify', verifyToken, verifyAdmin, (req, res) => {
    const { title, message, targetUser } = req.body;
    
    // Validação básica
    if (!title || !message) {
        return res.status(400).json({ success: false, error: 'Title and message required' });
    }

    const notification = {
        id: notifIdCounter++,
        title,
        message,
        read: false,
        timestamp: new Date().toLocaleString('pt-BR')
    };
    
    notifications.push(notification);

    // Se tiver um targetUser, envia só para ele. Se não, envia para todos (Broadcast)
    if (targetUser && users[targetUser]) {
        io.to(users[targetUser]).emit('new_notification', notification);
        console.log(`Notificação enviada para ${targetUser}:`, notification.title);
    } else {
        io.emit('new_notification', notification);
        console.log(`Broadcast enviado:`, notification.title);
    }

    res.status(200).json({ success: true, notification });
});

// ==== ROTAS DE AUTENTICAÇÃO (BACKEND) ====

// Signup via Admin (cria usuário usando Service Role)
app.post('/auth/signup', async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    try {
        const { data, error } = await adminSupabase.auth.admin.createUser({
            email: email,
            password: password,
            user_metadata: { full_name: fullName }
        });

        if (error) return res.status(400).json({ success: false, error: error.message });

        return res.json({ success: true, user: data.user });
    } catch (err) {
        console.error('signup error', err.message || err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Login backend (proxy) - cria sessão e retorna token
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return res.status(401).json({ success: false, error: error.message });

        return res.json({ success: true, session: data.session, user: data.user });
    } catch (err) {
        console.error('login error', err.message || err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Forgot password (envia email de recuperação)
app.post('/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`}/reset-password.html`
        });
        if (error) return res.status(400).json({ success: false, error: error.message });
        return res.json({ success: true });
    } catch (err) {
        console.error('forgot-password error', err.message || err);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Rota para obter histórico de notificações (opcional)
app.get('/api/notifications', (req, res) => {
    res.json(notifications);
});

// ==== WEBSOCKET (SOCKET.IO) ====

io.on('connection', (socket) => {
    console.log('\n✅ Novo usuário conectado:', socket.id);
    
    // Simular o login de um usuário e associar o ID do socket a ele
    socket.on('register', (userId) => {
        users[userId] = socket.id;
        console.log(`  └─ Registrado como: ${userId}`);
        
        // Enviar histórico de notificações ao conectar
        socket.emit('history', notifications);
        
        // Contar não lidas
        const unread = notifications.filter(n => !n.read).length;
        socket.emit('unread_count', unread);
    });

    // Marcar notificação como lida
    socket.on('mark_as_read', (notifId) => {
        const notif = notifications.find(n => n.id === notifId);
        if (notif) {
            notif.read = true;
            // Emitir atualização para o cliente
            socket.emit('notification_read', notifId);
            
            // Contar não lidas
            const unread = notifications.filter(n => !n.read).length;
            socket.emit('unread_count', unread);
        }
    });

    // Desconexão
    socket.on('disconnect', () => {
        console.log('❌ Usuário desconectado:', socket.id);
        
        // Remover usuário do mapeamento
        for (let user in users) {
            if (users[user] === socket.id) {
                delete users[user];
                console.log(`  └─ ${user} removido`);
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`⚙️  Admin: http://localhost:${PORT}/admin.html`);
});
