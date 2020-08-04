const express = require("express");
const tweetModel = require("./schema");
const path = require("path");
const multer = require("multer");
const fs = require("fs-extra");

const router = express.Router();
const upload = multer({});
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

router.post("/", upload.single("picture"), async (req, res) => {
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
    //
    const newTweet = new tweetModel(obj);
    await newTweet.save();
    res.send("tweeted");
  } catch (error) {
    console.log(error);
  }
});

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

//DELETE

router.delete("/:id", async (req, res) => {
  await postModel.findByIdAndDelete(req.params.id);
  res.send("Deleted sucessfully");
});

module.exports = router;
