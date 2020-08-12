const express = require("express");
const tweetModel = require("./schema");
const path = require("path");
const multer = require("multer");
const fs = require("fs-extra");

const router = express.Router();
const upload = multer({});
const ProfilesModel = require("../profiles/schema");
router.get("/", async (req, res) => {
  const tweets = await tweetModel.find();
  res.send(tweets);
});

// GET a specific tweet

router.get("/:id", async (req, res) => {
  tweetModel.findById(req.params.id, function (err, tweet) {
    res.send(tweet);
  });
});
router.post("/", async (req, res) => {
  console.log(req.body);
  const user = await ProfilesModel.findOne({ username: req.headers.username });
  var obj = { ...req.body, user };
  const newTweet = new tweetModel(obj);
  await newTweet.save();
  res.send(newTweet._id);
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
  console.log(req.params.id);

  const tweet = await tweetModel.findByIdAndUpdate(req.params.id, req.body);
  res.send("edited successfully");
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
  await tweetModel.findByIdAndDelete(req.params.id);
  res.send("Deleted sucessfully");
});

module.exports = router;
