const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const tweetRoutes = require("./tweets");
const profileRoutes = require("./profiles");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketio = require("socket.io");
dotenv.config();

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const server = express();
const socketServer = express();
const app = http.createServer(socketServer);

const io = socketio(app);
server.use(express.json({ limit: "50mb" }));
server.use(cookieParser());
server.use(cors(corsOptions));
server.use("/tweets", tweetRoutes);
server.use("/profiles", profileRoutes);

//socket
let users = [];
io.on("connection", (socket) => {
  let id = socket.id;
  let user;
  socket.on("info", ({ username }) => {
    const userExists = users.find((user) => user.username === username);
    if (!userExists) {
      users.push({ username, id });
    }
    user = username;
  });
  socket.on("likeAdded", ({ tweetedBy, likedBy, tweetText, tweetId }) => {
    const tweetOwner = users.find((user) => user.username === tweetedBy);
    console.log(tweetOwner);
    if (tweetOwner) {
      io.to(tweetOwner.id).emit("notification", {
        tweetedBy,
        likedBy,
        tweetText,
        tweetId,
      });
    }
  });
  socket.on("updateLikes", ({ tweetId }) => {
    users.forEach((user) => {
      io.to(user.id).emit("increaseLikes", {
        tweetId,
      });
    });
  });
  socket.on("updateDislikes", ({ tweetId }) => {
    users.forEach((user) => {
      io.to(user.id).emit("decreaseLikes", {
        tweetId,
      });
    });
  });

  socket.on("disconnect", () => {
    let newUsers = users.filter((element) => element.username !== user);
    users = newUsers;
  });
});

const url =
  "mongodb+srv://user7:user@community.hw7hj.mongodb.net/community?retryWrites=true&w=majority";
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(process.env.PORT || 3003, () => {
      console.log(`working on port 3003`);
    })
  );
mongoose.connection.on("connected", () => {
  console.log("connected to atlas");
});
app.listen(3004, () => {
  console.log("sockets running on 3004");
});
