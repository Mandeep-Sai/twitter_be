const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const tweetRoutes = require("./tweets");
const profileRoutes = require("./profiles");

const server = express();
server.use(express.json());
server.use(cors());
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
    server.listen(3003, () => {
      console.log(`working on port 3003`);
    })
  );
mongoose.connection.on("connected", () => {
  console.log("connected to atlas");
});
