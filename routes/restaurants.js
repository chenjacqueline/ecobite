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
  console.log(arr);
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
  let givenScores = [];
  // const totalAttributes = Object.keys(restaurantSchema).scores[0].length;

  for (const el of arr) {
    console.log("el: " + el.eatIn);
    if (el.eatIn >= 0) {
      eatIn += el.eatIn;
      eatInCount++;
      if (givenScores.indexOf(eatIn) == -1) {
        givenScores.push(eatIn);
      }
    }
    if (el.takeAway >= 0) {
      takeAway += el.takeAway;
      takeAwayCount++;
      if (givenScores.indexOf(takeAway) == -1) {
        givenScores.push(takeAway);
      }
    }
    if (el.reusableCup >= 0) {
      reusableCup += el.reusableCup;
      reusableCupCount++;
      if (givenScores.indexOf(reusableCup) == -1) {
        givenScores.push(reusableCup);
      }
    }
    if (el.veg >= 0) {
      veg += el.veg;
      vegCount++;
      if (givenScores.indexOf(veg) == -1) {
        givenScores.push(veg);
      }
    }
    if (el.dairy >= 0) {
      dairy += el.dairy;
      dairyCount++;
      if (givenScores.indexOf(dairy) == -1) {
        givenScores.push(dairy);
      }
    }
  }

  if (eatInCount != 0) {
    eatIn = eatIn / eatInCount;
  }

  if (takeAwayCount != 0) {
    takeAway = takeAway / takeAwayCount;
  }

  if (reusableCupCount != 0) {
    reusableCup = reusableCup / reusableCupCount;
  }

  if (vegCount != 0) {
    veg = veg / vegCount;
  }

  if (dairyCount != 0) {
    dairy = dairy / dairyCount;
  }

  score = (eatIn + takeAway + reusableCup + veg + dairy) / givenScores.length;

  console.log(Math.round(score * 10) / 10);
  return Math.round(score * 10) / 10;

  // return (score =
  //   (eatIn / eatInCount +
  //     takeAway / takeAwayCount +
  //     reusableCup / reusableCupCount +
  //     veg / vegCount +
  //     dairy / dairyCount) /
  //   givenScores.length);
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
          let scoreArray = [scores];
          let aggregateScore = calculateScore(scoreArray);
          console.log(scoreArray);

          Restaurant.create({
            id: restaurantId,
            scores,
            aggregatescore: aggregateScore
          }).then(() => {
            res.redirect("/restaurants");
          });
          // If restaurant exists
        } else {
          let scoreArray = [...response.scores, scores];
          // Calculate aggregate score with the test array (existing scores + new scores)
          let aggregateScore = calculateScore(scoreArray);
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
