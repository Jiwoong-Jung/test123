const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  // �޽��� ����
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // ��� Ŭ���̾�Ʈ���� �޽��� ����
  });

  // WebRTC ������ ���� �̺�Ʈ �ڵ鷯 �߰�
  socket.on('offer', (offer, targetSocketId) => {
    socket.to(targetSocketId).emit('offer', offer, socket.id);
  });

  socket.on('answer', (answer, targetSocketId) => {
    socket.to(targetSocketId).emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate, targetSocketId) => {
    socket.to(targetSocketId).emit('ice-candidate', candidate);
  });

  // ���� ����
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
