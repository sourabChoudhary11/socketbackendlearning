import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import{ config } from 'dotenv';
config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URI,
    }
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  console.log(socket.id,'a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    socket.to(socket.room).emit('user_left', `${socket.id} left room: ${socket.room}`);
  });

  socket.on('reconnect', () => {
    console.log('user reconnected', socket.id);
    socket.to(socket.room).emit('user_reconnected', `${socket.id} reconnected to room: ${socket.room}`);
  });

  socket.on('message', (msg) => {
    console.log('message: ' + msg);
    socket.to(socket.room).emit('message_received', msg);
  });

  socket.on('join_room', (room) => {
    socket.join(room);
    socket.room = room; // Store the room in the socket object
    console.log(`User joined room: ${socket.room}`);
    console.log(`Users in room ${room}:`, io.sockets.adapter.rooms.get(room));
    socket.to(room).emit('user_joined', `${socket.id} joined room: ${room}`);
  });
});
server.listen(8080, () => {
  console.log('listening on *:8080');
});