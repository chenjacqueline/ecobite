const express = require("express");
const router = express.Router();
const axios = require("axios");
const Score = require("../models/Score");
const Restaurant = require("../models/Restaurant");

router.post("/rating", (req, res, next) => {
  // create a book
  Score.create({
    eatIn: req.body,
    takeAway: req.body.description,
    reusableCup: req.body.rating,
    veg: req.body.author,
    dairy: req.body.
  })
    .then(createdBook => {
      console.log(req.body);
      res.redirect(`/restaurants`);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
