const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  scores: [
    {
      type: mongoose.Schema.Types.ObjectId, // We will have an array of Object IDs
      ref: "Score"
    }
  ],
  aggregatescore: Number
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;
