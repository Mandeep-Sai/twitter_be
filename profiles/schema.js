const { Schema, model } = require("mongoose");

const ProfilesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    area: {
      type: String,
      require: true,
    },
    image: {
      type: Buffer,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ProfilesModel = model("Profiles", ProfilesSchema);
module.exports = ProfilesModel;
