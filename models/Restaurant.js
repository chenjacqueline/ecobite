const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  coordinates: [Number],
  photo: {
    type: String
    //default photo needed
  },
  categories: {
    type: Array
  },
  score: {
    type: Schema.Types.ObjectId,
    ref: "Score"
  }
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;
