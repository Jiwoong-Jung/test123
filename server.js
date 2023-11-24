const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  // 메시지 수신
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // 모든 클라이언트에게 메시지 전송
  });

  // WebRTC 연결을 위한 이벤트 핸들러 추가
  socket.on('offer', (offer, targetSocketId) => {
    socket.to(targetSocketId).emit('offer', offer, socket.id);
  });

  socket.on('answer', (answer, targetSocketId) => {
    socket.to(targetSocketId).emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate, targetSocketId) => {
    socket.to(targetSocketId).emit('ice-candidate', candidate);
  });

  // 연결 해제
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
