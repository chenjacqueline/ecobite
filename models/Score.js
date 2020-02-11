const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scoreSchema = new Schema({
  userID: {
    type: String,
    required: true
  },
  restaurantID: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now()
  },
  scores: {
    eatIn: Number,
    takeAway: Number,
    reusableCup: Number,
    veg: Number,
    dairy: Number
  }
});

const Score = mongoose.model("Score", scoreSchema);
module.exports = Score;
