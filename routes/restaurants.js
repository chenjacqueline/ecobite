const express = require("express");
const router = express.Router();
const axios = require("axios");
const Score = require("../models/Score");
const Restaurant = require("../models/Restaurant");
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const endpoint = `https://api.foursquare.com/v2/venues/search?ll=52.5200,13.40508&radius=2000&limit=50&query=food&intent=browse&client_id=${clientId}&client_secret=${clientSecret}&v=20200210`;

router.get("/restaurants", (req, res, next) => {
  return getRestaurantList().then(({ data }) => {
    const restaurantsJSON = data.response.venues;
    res.render("restaurants", { restaurantsList: restaurantsJSON });
  });
});

// FUNCTIONS
function getRestaurantList() {
  return axios
    .get(endpoint)
    .then(response => {
      return response;
    })
    .catch(err => {
      console.log(err);
    });
}

function calculateScore(arr) {
  // Total score per attribute
  let eatIn = 0;
  let takeAway = 0;
  let reusableCup = 0;
  let veg = 0;
  let dairy = 0;

  // Amount of scores per attribute
  let eatInCount = 0;
  let takeAwayCount = 0;
  let reusableCupCount = 0;
  let vegCount = 0;
  let dairyCount = 0;

  let score;
  // const totalAttributes = Object.keys(restaurantSchema).scores[0].length;

  // for (let i = 0; i < scores.length; i++) {
  for (const el of arr) {
    if (el.eatIn) {
      eatIn += el.eatIn;
      eatInCount++;
    }
    if (el.takeAway) {
      takeAway += el.takeAway;
      takeAwayCount++;
    }
    if (el.reusableCup) {
      reusableCup += el.reusableCup;
      reusableCupCount++;
    }
    if (el.veg) {
      veg += el.veg;
      vegCount++;
    }
    if (el.dairy) {
      dairy += el.dairy;
      dairyCount++;
    }
  }
  return (score =
    (eatIn / eatInCount +
      takeAway / takeAwayCount +
      reusableCup / reusableCupCount +
      veg / vegCount +
      dairy / dairyCount) /
    5);
  // return (score = Math.round(score * 10) / 10);
}

// What about cafes?? (totalAttributes)

// FOURSQUARE JSON
router.get("/restaurantData", (req, res, next) => {
  getRestaurantList()
    .then(restaurantsList => {
      // res.json(restaurantsList.data.response.venues); // array of objects
      res.json(restaurantsList.data.response.venues);
    })
    .catch(err => {
      next(err);
    });
});

// LINK FROM THE RESTAURANT PARTIAL
router.get("/:restaurantId/score", (req, res, next) => {
  res.render("rating", { restaurantId: req.params.restaurantId });
});

// SUBMISSION OF SCORE FORM
router.post("/:restaurantId/score", (req, res, next) => {
  // console.log(req.body);
  let restaurantId = req.params.restaurantId;

  // USER-INPUT VALUES FROM THE SCORE FORM
  const scores = {
    eatIn: parseInt(req.body.eatIn),
    takeAway: parseInt(req.body.takeAway),
    reusableCup: parseInt(req.body.reusableCup),
    veg: parseInt(req.body.veg),
    dairy: parseInt(req.body.dairy)
  };

  // CREATE A NEW SCORE
  Score.create({
    userID: req.user._id,
    restaurantID: restaurantId, // Foursquare, not Mongo
    scores
  })
    .then(() => {
      Restaurant.findOne({ id: restaurantId }).then(response => {
        // If restaurant doesn't exist
        if (!response) {
          // let testArr = [scores];
          // let aggregateScore = calculateScore(testArr);
          // console.log(aggregateScore);

          Restaurant.create({
            id: restaurantId,
            scores,
            aggregatescore: aggregateScore
          }).then(() => {
            res.redirect("/restaurants");
          });
          // If restaurant exists
        } else {
          let testArr = [...response.scores, scores];
          // Calculate aggregate score with the test array (existing scores + new scores)
          let aggregateScore = calculateScore(testArr);
          console.log(aggregateScore);

          Restaurant.findByIdAndUpdate(response._id, {
            // Pushing scores into the scores (array of objects)
            $push: { scores },
            // Updating the aggregate score
            aggregatescore: aggregateScore
          }).then(() => {
            res.redirect("/restaurants");
          });
        }
      });

      // res.redirect("/restaurants");
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
