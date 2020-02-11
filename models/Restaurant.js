const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  scores: [{
    eatIn: Number,
    takeAway: Number,
    reusableCup: Number,
    veg: Number,
    dairy: Number
  }]
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;
