const mongoose = require("mongoose");

const gameSchema = mongoose.Schema({
  name: { type: String, required: true },
});

module.exports = mongoose.model("Game", gameSchema);