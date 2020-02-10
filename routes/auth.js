const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Score = require("../models/Score");

// SIGN UP WITH EMAIL ADDRESS
router.get("/signup", (req, res, next) => {
  res.render("signup");
});

module.exports = router;
