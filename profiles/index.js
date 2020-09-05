const express = require("express");
const ProfilesSchema = require("./schema");
const profilesRouter = express.Router();
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const upload = multer({});
const bcrypt = require("bcrypt");

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
profilesRouter.get("/:username", async (req, res, next) => {
  try {
    const username = req.params.username;
    const profile = await ProfilesSchema.findOne({ username: username });
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
// register

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
    await ProfilesSchema.findByIdAndUpdate(req.params.id, obj);
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
profilesRouter.put("/:id", async (req, res, next) => {
  try {
    const profile = await ProfilesSchema.findOneAndUpdate(
      req.params.id,
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
profilesRouter.delete("/:id", async (req, res, next) => {
  try {
    const profile = await ProfilesSchema.findByIdAndDelete(req.params.id);
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
