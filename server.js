const path = require("path");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const redis = require("redis");
const connectRedis = require("connect-redis");
const socketio = require("socket.io");
const {
  userJoin,
  getCurrentUser,
  getUserInRoom,
  userLeave,
  getRoomUsers,
  formatMessage,
  getMessageHistory,
  saveMessageHistory,
  encrypt,
  decrypt,
  key,
} = require("./utils");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const dotenv = require("dotenv");

// Call .env value
if (process.env.NODE_ENV.trim() === "development") dotenv.config();

// From .env
const botName = process.env.APPNAME;
const PORT = process.env.PORT;
const REDISHOST = process.env.REDISHOST;
const REDISPORT = process.env.REDISPORT;
const REDISPASSWORD = process.env.REDISPASSWORD;

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Set session
app.set("trust proxy", 1);
const RedisStore = connectRedis(session);

//Configure redis client
const redisClient = redis.createClient({
  host: REDISHOST,
  port: REDISPORT,
  password: REDISPASSWORD,
});

// Do something when cannot connect to redis
redisClient.on("error", function (err) {
  console.log(
    "Could not establish a connection with redis. " + err,
    `${REDISHOST}:${REDISPORT}`
  );
});

// Do something when connected to redis
redisClient.on("connect", function () {
  console.log("Connected to redis successfully", `${REDISHOST}:${REDISPORT}`);
});

// Create session config
const sharedsession = session({
  store: new RedisStore({ client: redisClient }),
  secret: key,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // if true only transmit cookie over https
    httpOnly: false, // if true prevent client side JS from reading the cookie
    maxAge: 24 * 60 * 60 * 1000, // 24 Hour {Hour * Minute * Second * Milisecond}
  },
});

app.use(sharedsession);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

io.use((socket, next) => {
  sharedsession(socket.request, socket.request.res || {}, next);
});

app.get("/", (req, res) => {
  // redirect user to chat page if session is still alive otherwise user have to login
  if (req.session.userdata) {
    res.redirect("/chat.html");
  } else {
    res.redirect("/login.html");
  }
});

app.post("/login", (req, res) => {
  try {
    const { username, room } = decrypt(req.body.encryptedData);
    const user = getUserInRoom(username, room);
    if (!user) {
      req.session.userdata = req.body.encryptedData;
    }
    res.status(200).send({
      message: user ? "username already in use" : "OK",
      valid: !user,
      id: req.body.encryptedData,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// if client logout destroy the session
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).send({ success: true });
});

// Run when client connects
io.on("connection", (socket) => {
  // check username if already in use inside the room
  socket.on("checkUsername", (data) => {
    if (!user) {
      socket.request.session.userdata = data;
    }
    io.to(socket.id).emit("isUsernameValid", encrypt(!user));
  });

  // join room
  socket.on("joinRoom", (data) => {
    try {
      const { username, room } = decrypt(data);
      const user = userJoin(socket.id, username, room);
      socket.join(user.room);

      // Broadcast when a user connects
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          encrypt(
            formatMessage(
              botName,
              `${user.username} has joined the chat`,
              user.room
            )
          )
        );

      // Send users and room info
      io.to(user.room).emit(
        "roomUsers",
        encrypt({
          room: user.room,
          users: getRoomUsers(user.room),
        })
      );

      // Send chat history
      io.to(socket.id).emit("chatHistory", getMessageHistory(user.room));
    } catch (error) {
      io.to(socket.id).emit("unauthorized", {});
    }
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    try {
      const decryptedMsg = decrypt(msg);
      const user = getCurrentUser(socket.id);
      const formatted = formatMessage(user.username, decryptedMsg, user.room);
      saveMessageHistory(encrypt(formatted));

      io.to(user.room).emit("message", encrypt(formatted));
    } catch (error) {
      io.to(socket.id).emit(
        "message",
        encrypt(
          formatMessage(botName, "Cannot send message. Please try again", "")
        )
      );
    }
  });

  // Run when client disconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        encrypt(
          formatMessage(
            botName,
            `${user.username} has left the chat`,
            user.room
          )
        )
      );

      // Send users and room info
      io.to(user.room).emit(
        "roomUsers",
        encrypt({
          room: user.room,
          users: getRoomUsers(user.room),
        })
      );
    }
  });
});

server.listen(PORT, "0.0.0.0", () =>
  console.log(
    `${botName} ${process.env.NODE_ENV} running on port ${PORT}. ENJOY!!!`
  )
);
