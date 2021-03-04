const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  formatMessage,
  encrypt,
  decrypt
} = require('./utils');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const dotenv = require('dotenv');
dotenv.config()

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = process.env.APPNAME;
const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.redirect('/login.html');
})

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', (data) => {
    const { username, room } = decrypt(data);
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', encrypt(formatMessage(botName, `Welcome to ${botName}`)));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        encrypt(formatMessage(botName, `${user.username} has joined the chat`))
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', encrypt({
      room: user.room,
      users: getRoomUsers(user.room)
    }));
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const decryptedMsg = decrypt(msg);
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', encrypt(formatMessage(user.username, decryptedMsg)));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        encrypt(formatMessage(botName, `${user.username} has left the chat`))
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', encrypt({
        room: user.room,
        users: getRoomUsers(user.room)
      }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));