const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
  
const io = new Server(server, {
  cors: {
    origin: '*', // 👈 in production, set your OHIF viewer URL
    methods: ['GET', 'POST'],
  },
});

io.on('connection', socket => {
  console.log('🔵 A user connected:', socket.id);

  // join a study-specific room
  socket.on('joinRoom', ({ roomId, user }) => {
    socket.join(roomId);
    console.log(`${user} joined room: ${roomId}`);
    io.to(roomId).emit('systemMessage', `${user} joined`);
  });

  // broadcast chat messages
  socket.on('chatMessage', ({ roomId, user, message }) => {
    const msg = { user, message, time: new Date() };
    console.log('💬', roomId, msg);
    io.to(roomId).emit('chatMessage', msg);
    // Optional: save to DB here
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('✅ Chat server running on :4000');
});
