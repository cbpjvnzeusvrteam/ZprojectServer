const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const rooms = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('create-room', () => {
    const roomCode = Math.random().toString(36).substr(2, 6);
    rooms[roomCode] = [socket.id];
    socket.join(roomCode);
    socket.emit('room-created', roomCode);
  });

  socket.on('join-room', (roomCode) => {
    if (rooms[roomCode]?.length === 1) {
      rooms[roomCode].push(socket.id);
      socket.join(roomCode);
      socket.emit('room-joined', roomCode);
      io.to(roomCode).emit('start-game');
    } else {
      socket.emit('error', 'Phòng không tồn tại hoặc đã đủ người');
    }
  });

  socket.on('move', ({ roomCode, index, symbol }) => {
    socket.to(roomCode).emit('move', { index, symbol });
  });
});

server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});