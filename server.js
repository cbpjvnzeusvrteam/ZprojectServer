const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// ⚠️ Bật CORS cho Socket.IO để cho phép frontend từ domain khác kết nối
const io = new Server(server, {
  cors: {
    origin: '*', // hoặc thay bằng 'https://zproject.x10.mx' để bảo mật hơn
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const rooms = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('create-room', () => {
    const roomCode = Math.random().toString(36).substr(2, 6);
    rooms[roomCode] = [socket.id];
    socket.join(roomCode);
    socket.emit('room-created', roomCode);
    console.log(`📦 Room ${roomCode} created`);
  });

  socket.on('join-room', (roomCode) => {
    if (rooms[roomCode]?.length === 1) {
      rooms[roomCode].push(socket.id);
      socket.join(roomCode);
      socket.emit('room-joined', roomCode);
      io.to(roomCode).emit('start-game');
      console.log(`✅ ${socket.id} joined room ${roomCode}`);
    } else {
      socket.emit('error', 'Phòng không tồn tại hoặc đã đủ người');
    }
  });

  socket.on('move', ({ roomCode, index, symbol }) => {
    socket.to(roomCode).emit('move', { index, symbol });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});