const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scoreSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  restaurantID: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now()
  },
  scores: {
    eatIn: Boolean,
    takeAway: Number,
    reusableCup: Boolean,
    veg: Number,
    dairy: Boolean
  }
});

const Score = mongoose.model("Score", scoreSchema);
module.exports = Score;
