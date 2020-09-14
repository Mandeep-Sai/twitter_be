const express = require("express");
const ProfilesSchema = require("./schema");
const tweetModel = require("../tweets/schema");
const profilesRouter = express.Router();
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const upload = multer({});
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Get all profiles
profilesRouter.get("/", async (req, res, next) => {
  try {
    const profiles = await ProfilesSchema.find();
    res.status(200).send(profiles);
  } catch (error) {
    next(error);
  }
});

// Get single profile
profilesRouter.get("/me", async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    console.log(decoded);
    const profile = await ProfilesSchema.findById(decoded.id);
    if (profile) {
      res.status(200).send(profile);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("While reading profiles list a problem occurred!");
  }
});

// searching profile with a alan voice AI
profilesRouter.get("/voice/:username", async (req, res, next) => {
  try {
    const name = req.params.username;
    const profile = await ProfilesSchema.find({ username: name });
    if (profile) {
      res.status(200).send(profile);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("While reading profiles list a problem occurred!");
  }
});

profilesRouter.get("/:username", async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);

    const profile = await ProfilesSchema.findOne({
      username: req.params.username,
    });
    if (profile) {
      res.status(200).send(profile);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("While reading profiles list a problem occurred!");
  }
});
// login

profilesRouter.post("/login", async (req, res) => {
  const profile = await ProfilesSchema.findOne({
    $or: [{ username: req.body.username }, { email: req.body.username }],
  });
  const isAuthorized = await bcrypt.compare(
    req.body.password,
    profile.password
  );
  console.log(isAuthorized);
  if (isAuthorized) {
    const secretkey = process.env.SECRET_KEY;
    const payload = { id: profile._id };
    const token = await jwt.sign(payload, secretkey, { expiresIn: "1 week" });
    console.log(token);
    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: "none",
      secure: false,
    });
    res.send("ok");
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// Post a new image for a profile
profilesRouter.post(
  "/:id/uploadImage",
  upload.single("picture"),
  async (req, res) => {
    const imagesPath = path.join(__dirname, "/images");
    await fs.writeFile(
      path.join(
        imagesPath,
        req.params.id + "." + req.file.originalname.split(".").pop()
      ),
      req.file.buffer
    );

    //
    var obj = {
      image: fs.readFileSync(
        path.join(
          __dirname +
            "/images/" +
            req.params.id +
            "." +
            req.file.originalname.split(".").pop()
        )
      ),
    };
    //
    async function asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    }
    //
    await ProfilesSchema.findByIdAndUpdate(req.params.id, obj);
    const token = req.cookies.accessToken;
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    const modifiedUser = await ProfilesSchema.findOne({ _id: decoded.id });
    const tweets = await tweetModel.find({
      "user.username": modifiedUser.username,
    });
    asyncForEach(tweets, async (tweet) => {
      await tweetModel.findByIdAndUpdate(tweet._id, { user: modifiedUser });
    });

    console.log(tweets);

    res.send("image added successfully");
  }
);

// Post a new profile
profilesRouter.post(
  "/register",
  upload.single("image"),
  async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const profile = await ProfilesSchema.findOne({
      $or: [{ username: username }, { email: email }],
    });
    const plainPassword = req.body.password;
    req.body.password = await bcrypt.hash(plainPassword, 8);
    if (profile) {
      res.status(400).send("username exists");
    } else {
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
          var obj = {
            ...req.body,
            image: fs.readFileSync(
              path.join(__dirname, "./images/default.png")
            ),
          };
        }

        const newProfile = new ProfilesSchema(obj);
        await newProfile.save();
        res.send("ok");
      } catch (error) {
        next(error);
      }
    }
  }
);

// Modifie a profile
profilesRouter.put("/me", async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    const profile = await ProfilesSchema.findByIdAndUpdate(
      decoded.id,
      req.body
    );
    if (profile) {
      res.status(200).send("OK");
    } else {
      const error = new Error(`Profile with id ${req.params.id} not found!`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

// Delete a profile
profilesRouter.delete("/me", async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    const profile = await ProfilesSchema.findByIdAndDelete(decoded.id);
    if (profile) {
      res.status(200).send("Delete!");
    } else {
      const error = new Error(`Profile with id ${req.params.id} not found!`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = profilesRouter;
