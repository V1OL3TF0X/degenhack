const mongoose = require("mongoose");

const gameSchema = mongoose.Schema({
  name: { type: String, required: true },
  participants: { type: [{userId: { type: String }, tokens: { type: Number, default: 0 }}], required: false },
  winnerId: { type: String, required: false },
  prize: { type: Number, required: false, default: 0 },
  minParticipants: { type: Number, required: true },
  maxParticipants: { type: Number, required: true },
  timestampStart: { type: Number, required: false, default: 0 },
  timestampEnd: { type: Number, required: false, default: 0  },
  embeddedUrl: { type: String, required: true }
});

module.exports = mongoose.model("Game", gameSchema);