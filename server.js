const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

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
app.post('/api/notify', (req, res) => {
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
