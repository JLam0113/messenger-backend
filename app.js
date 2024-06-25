const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const dotenv = require('dotenv').config()
const bcrypt = require('bcryptjs');
const User = require("./models/user");
const ChatRoom = require("./models/chatroom");
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const cors = require('cors');
const { createServer } = require("http");
const { Server } = require("socket.io");

let indexRouter = require('./routes/index');
let signUpRouter = require('./routes/signup');
let chatRoomRouter = require('./routes/chatroom');
let messageRouter = require('./routes/message');
let userRouter = require('./routes/user');

const app = express();
const server = createServer(app);
const socketOptions = {
  cors: {
    origin: "http://localhost:5173"
  }
};

const io = new Server(server, socketOptions);

const mongoDb = "mongodb+srv://" + dotenv.parsed.USERNAME + ":" + dotenv.parsed.PASSWORD + "@cluster0.y2sspz1.mongodb.net/messenger?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

passport.use('login',
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      };
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" })
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    };
  })
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: dotenv.parsed.SECRET,
      jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

const corsOptions = {
  origin: true, //included origin as true
  credentials: true, //included credentials as true
};
app.use(cors(corsOptions));

app.use('/', indexRouter);
app.use('/signup', signUpRouter);
app.use('/chatroom', chatRoomRouter);
app.use('/message', messageRouter);
app.use('/user', userRouter);

let users = [];

io.on("connection", (socket) => {
  socket.on("addUser", userID => {
    const userExists = users.find(user => user.userID === userID);
    if (!userExists) {
      const user = { userID, socketID: socket.id };
      users.push(user);
      console.log(user.userID + " is connected");
    }
  });

  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  socket.on("sendMessage", async ({ messageID, chatroomID, senderID, message, date }) => {
    const chatroom = await ChatRoom.findById(chatroomID).populate('users');
    const sender = await User.findById(senderID);
    if (chatroom.users !== undefined) {
      chatroom.users.forEach((receiver) => {
        if (!receiver._id.equals(senderID)) {
          const receiverID = users.find(user => receiver._id.equals(user.userID));
          if (receiverID !== undefined) {
            io.to(receiverID.socketID).emit("getMessage", {
              id: messageID,
              username: sender.username,
              message,
              date
            });
          }
        }
      })
    }
  });


  socket.on("disconnect", () => {
    users = users.filter(user => user.socketId !== socket.id);
  });

})

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  console.error(err.stack)
  res.status(500).json({ error: err });
});

server.listen(3000);

module.exports = app;