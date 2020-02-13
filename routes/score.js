const express = require("express");
const router = express.Router();
// const axios = require("axios"); // Is this needed in this file?
const Score = require("../models/Score");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const calculateScore = require("../algorithms/scoring.js");

// SUBMISSION OF SCORE FORM
router.post("/:restaurantId/score", (req, res, next) => {
  // console.log(req.body);
  let restaurantId = req.params.restaurantId;
  let userId = req.user._id;
  console.log("User found: ", userId);
  let userRestaurants = req.user.ratedRestaurants;

  // USER-INPUT VALUES FROM THE SCORE FORM
  const scores = {
    eatIn: parseInt(req.body.eatIn),
    takeAway: parseInt(req.body.takeAway),
    reusableCup: parseInt(req.body.reusableCup),
    veg: parseInt(req.body.veg),
    dairy: parseInt(req.body.dairy)
  };

  User.findById(userId, () => {
    // Finds the logged in user by Id and checks whether they have already scored this restaurant: if TRUE, update existing score, if FALSE, add a new score
    if (userRestaurants.includes(restaurantId)) {
      Score.findOneAndUpdate({ userID: userId }, { scores }).then(() => {
        res.redirect("/restaurants");
      });
    }

    // CREATE A NEW SCORE
    else
      Score.create({
        userID: req.user._id,
        restaurantID: restaurantId, // Foursquare, not Mongo
        scores
      })
        .then(() => {
          User.findOneAndUpdate(
            { _id: req.user._id },
            {
              $push: {
                ratedRestaurants: restaurantId
              }
            }
          ).then();
        })
        .then(data => {
          console.log(data);
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
});

module.exports = router;
