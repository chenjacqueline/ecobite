const express = require("express");
const router = express.Router();
const axios = require("axios");
const Score = require("../models/Score");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const calculateScore = require("../algorithms/scoring.js"); // ARE THESE NEEDED IN THIS FILE?
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const endpoint = `https://api.foursquare.com/v2/venues/search?ll=52.5200,13.40508&radius=2000&limit=50&query=food&intent=browse&client_id=${clientId}&client_secret=${clientSecret}&v=20200210`;

router.get("/restaurants", (req, res, next) => {
  return getRestaurantList().then(({ data }) => {
    const restaurantsJSON = data.response.venues;

    // Looping through array of Foursquare restaurants
    for (const restaurant of restaurantsJSON) {
      // If restaurant in database with a Foursquare ID:
      Restaurant.findOne({ id: restaurant.id })
        .then(restaurantDocument => {
          // Add an aggregate score property + value to Foursquare obj:
          restaurant.aggregatescore = restaurantDocument.aggregatescore;

          // Set quality levels:
          // if (restaurant.aggregatescore > 8) {
          //   restaurant.level = "high";
          // } else if (restaurant.aggregatescore > 5) {
          //   restaurant.level = "medium";
          // } else {
          //   restaurant.level = "low";
          // }
          // return restaurant;
        })

        // If restaurant doesn't exist in database with Foursquare ID:
        .catch(() => {
          console.log("No existing aggregate score yet.");
        });
    }
    // Render the restaurants page with the updated restaurantsJSON:
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

const loginCheck = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect("/restaurants");
  }
};

// LINK FROM THE RESTAURANT PARTIAL
router.get("/:restaurantId/score", loginCheck, (req, res, next) => {
  console.log(req.user);
  User.findById(req.user._id).then(foundUser => {
    const check = foundUser.ratedRestaurants.includes(req.params.restaurantId);
    if (check) {
      res.redirect(`/${req.params.restaurantId}/edit`);
    } else {
      res.render("scoreform", { restaurantId: req.params.restaurantId });
    }
  });
});

router.get("/:restaurantId/edit", loginCheck, (req, res, next) => {
  Score.findOne({
    userID: req.user._id,
    restaurantID: req.params.restaurantId
  }).then(scoreDocument => {
    res.render("editform", { userScore: scoreDocument });
  });
});

router.post("/:restaurantId/edit", (req, res, next) => {
  Score.findOne({
    userID: req.user._id,
    restaurantID: req.params.restaurantId
  }).then(scoreDocument => {
    Score.findByIdAndUpdate(scoreDocument._id, { ...req.body }).then(() => {
      res.redirect("/restaurants");
    });
  });
});

router.post("/:restaurantId/score", (req, res, next) => {
  // console.log(req.body);
  let restaurantId = req.params.restaurantId; // current restaurant
  const userID = req.user._id; // current user

  // USER-INPUT VALUES FROM THE ADD SCORE FORM
  const scores = {
    eatIn: parseInt(req.body.eatIn),
    takeAway: parseInt(req.body.takeAway),
    reusableCup: parseInt(req.body.reusableCup),
    veg: parseInt(req.body.veg),
    dairy: parseInt(req.body.dairy)
  };

  // CREATE A NEW SCORE
  Score.create({
    userID: userID,
    restaurantID: restaurantId, // Foursquare, not Mongo
    scores: scores
  })
    // PUSHING THE RESTAURANT TO RATED RESTAURANTS LIST FOR A USER
    .then(createdScore => {
      User.findByIdAndUpdate(
        userID,
        {
          $push: {
            ratedRestaurants: restaurantId
          }
        },
        { new: true }
      )
        .then(updatedUserDocument => {
          console.log(updatedUserDocument);
          Restaurant.findOne({ id: restaurantId })
            .populate("scores")
            .then(restaurantFromDB => {
              // If restaurant doesn't exist
              if (!restaurantFromDB) {
                let scoreArray = [scores];
                let aggregateScore = calculateScore(scoreArray);
                console.log(scores);
                console.log(scoreArray);
                console.log(aggregateScore);
                Restaurant.create({
                  id: restaurantId,
                  scores: [createdScore._id],
                  aggregatescore: aggregateScore
                }).then(() => {
                  res.redirect("/restaurants");
                });
                // If restaurant exists
              } else {
                let scoreArray = [...restaurantFromDB.scores, scores];
                // Calculate aggregate score with the test array (existing scores + new scores)
                let aggregateScore = calculateScore(scoreArray);
                console.log(aggregateScore);
                Restaurant.findByIdAndUpdate(restaurantFromDB._id, {
                  $push: { scores: createdScore._id },
                  aggregatescore: aggregateScore
                }).then(() => {
                  res.redirect("/restaurants");
                });
              }
            });
        })
        .catch(err => {
          next(err);
        });
    });
});

module.exports = router;

// // Get Foursquare data:
// return getRestaurantList().then(({ data }) => {
//   const restaurantsJSON = data.response.venues;

//   const restaurantId = req.params.restaurantId;
//   let restaurantName;

//   // Find name of restaurant with that restaurant id:
//   for (const restaurant of restaurantsJSON) {
//     if (restaurant.id === restaurantId) {
//       return (restaurantName = restaurant.name);
//     }
//   }

//   res.render("scoreform", {
//     restaurantId: req.params.restaurantId,
//     restaurantName: restaurantName
//   });
// });
