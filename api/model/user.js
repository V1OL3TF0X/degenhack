const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  publicKey: { type: String, required: true },
  avatarLink: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);