const { Schema, model } = require("mongoose");
const ProfilesModel = require("../profiles/schema");

const tweetSchema = new Schema(
  {
    text: {
      type: String,
    },
    image: {
      type: Buffer,
    },
    user: ProfilesModel.schema,
    likes: Number,
    likedBy: Array,
  },
  { timestamps: true }
);

const tweetModel = model("tweet", tweetSchema);
module.exports = tweetModel;
