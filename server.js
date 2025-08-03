// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Replace * with your domain in production
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', ({ senderId, receiverId }) => {
    const room = [senderId, receiverId].sort().join('-');
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('send-message', (message) => {
    const room = [message.sender, message.receiver].sort().join('-');
    io.to(room).emit('new-message', message);
    console.log(`Sending message to room ${room}`, message);
  });

  socket.on('read-message', ({ messageId, sender, receiver }) => {
    const room = [sender, receiver].sort().join('-');
    io.to(room).emit('message-read', { messageId });
    console.log(`Message ${messageId} marked as read in room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Socket.IO server running on ${PORT}`));
