const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String
    // required: true, // We need front-end validation, otherwise social login won't work
  },
  password: {
    type: String
    // required: true
  },
  city: {
    type: String,
    enum: ["Berlin"]
  },
  // social login, restaurants scored
  facebookId: String,
  googleId: String,
  ratedRestaurants: [String]
});

const User = mongoose.model("User", userSchema);
module.exports = User;
