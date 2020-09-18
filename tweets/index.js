const express = require("express");
const tweetModel = require("./schema");
const path = require("path");
const multer = require("multer");
const fs = require("fs-extra");
const jwt = require("jsonwebtoken");

const router = express.Router();
const upload = multer({});
const ProfilesModel = require("../profiles/schema");

router.get("/", async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    console.log(decoded);
    const tweets = await tweetModel.find();
    res.send(tweets);
  } catch (error) {
    console.log(error);
    res.status(401).send("Token expired");
  }
});

// GET a specific tweet

router.get("/:id", async (req, res) => {
  tweetModel.findById(req.params.id, function (err, tweet) {
    res.send(tweet);
  });
});
router.post("/", async (req, res) => {
  console.log(req.body);
  const token = req.cookies.accessToken;
  const decoded = await jwt.verify(token, process.env.SECRET_KEY);
  const user = await ProfilesModel.findOne({ _id: decoded.id });
  var obj = { ...req.body, user, likes: 0 };
  const newTweet = new tweetModel(obj);
  await newTweet.save();
  res.send(newTweet._id);
});

router.post("/addLike", async (req, res) => {
  let tweet = await tweetModel.findById(req.body.tweetId);
  let updatedLikes = tweet.likes + 1;
  let updatedTweet = await tweetModel.findByIdAndUpdate(req.body.tweetId, {
    likes: updatedLikes,
  });
  console.log(updatedTweet);
  res.send("added like");
});
router.post("/removeLike", async (req, res) => {
  let tweet = await tweetModel.findById(req.body.tweetId);
  let updatedLikes = tweet.likes - 1;
  let updatedTweet = await tweetModel.findByIdAndUpdate(req.body.tweetId, {
    likes: updatedLikes,
  });
  console.log(updatedTweet);
  res.send("removed like");
});

router.post("/:id", upload.single("picture"), async (req, res) => {
  try {
    if (req.file) {
      const imagesPath = path.join(__dirname, "/images");
      await fs.writeFile(
        path.join(
          imagesPath,
          req.headers.username +
            req.file.originalname +
            "." +
            req.file.originalname.split(".").pop()
        ),
        req.file.buffer
      );
      var obj = {
        image: fs.readFileSync(
          path.join(
            __dirname +
              "/images/" +
              req.headers.username +
              req.file.originalname +
              "." +
              req.file.originalname.split(".").pop()
          )
        ),
      };
    }
    await tweetModel.findByIdAndUpdate(req.params.id, obj);
    res.send("tweeted");
  } catch (error) {
    console.log(error);
  }
});

router.put("/:id", async (req, res) => {
  const token = req.cookies.accessToken;
  const decoded = await jwt.verify(token, process.env.SECRET_KEY);
  const user = await ProfilesModel.findOne({ _id: decoded.id });
  if (user) {
    const tweet = await tweetModel.findByIdAndUpdate(req.params.id, req.body);
    res.send("edited successfully");
  }
});
/*
//PUT
router.put("/:id", upload.single("picture"), async (req, res) => {
  try {
    if (req.file) {
      const imagesPath = path.join(__dirname, "/images");
      await fs.writeFile(
        path.join(
          imagesPath,
          req.body.username + "." + req.file.originalname.split(".").pop()
        ),
        req.file.buffer
      );
      var obj = {
        ...req.body,
        image: fs.readFileSync(
          path.join(
            __dirname +
              "/images/" +
              req.body.username +
              "." +
              req.file.originalname.split(".").pop()
          )
        ),
      };
    } else {
      var obj = { ...req.body };
    }
    await tweetModel.findByIdAndUpdate(req.params.id, obj);
    res.send("updated sucessfully");
  } catch (error) {}
});
*/
//DELETE

router.delete("/:id", async (req, res) => {
  const token = req.cookies.accessToken;
  const decoded = await jwt.verify(token, process.env.SECRET_KEY);
  const user = await ProfilesModel.findOne({ _id: decoded.id });
  if (user) {
    await tweetModel.findByIdAndDelete(req.params.id);
    res.send("Deleted sucessfully");
  }
});

module.exports = router;
