const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const tweetRoutes = require("./tweets");
const profileRoutes = require("./profiles");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
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
server.use(express.json({ limit: "50mb" }));
server.use(cookieParser());
server.use(cors(corsOptions));
server.use("/tweets", tweetRoutes);
server.use("/profiles", profileRoutes);

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
