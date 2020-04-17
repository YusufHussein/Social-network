const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  mongoose.Schema({
    username: {
      type: String,
      requierd: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: String,
    location: String,
    dateOfBirth: {
      type: Date,
    },
    notifications: [
      {
        type: String,
      },
    ],
    blocked: {
      type: Boolean,
      default: false,
    },
    bad_post_count: {
      type: Number,
      default: 0,
    },
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
  })
);

module.exports = User;
