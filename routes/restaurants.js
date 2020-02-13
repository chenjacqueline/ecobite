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

// LINK FROM THE RESTAURANT PARTIAL
router.get("/:restaurantId/score", (req, res, next) => {
  //console.log("Link found a user: ", req.user);
  let userId = req.user._id;
  let userRestaurants = req.user.ratedRestaurants;
  let restaurantId = req.params.restaurantId;

  User.findById(userId, () => {
    // Finds logged in user by ID and checks whether they have scored this restaurant yet, if FALSE, takes the user to a new score form, if TRUE, takes the user to an update score form

    if (!userRestaurants.includes(restaurantId)) {
      console.log("Restaurant not found");
      res.render("scoreform", { restaurantId });
    } else {
      console.log("Restaurant found");
      res.render("updateform", { restaurantId });
    }
  });

  // res.render("scoreform", { restaurantId: req.params.restaurantId });
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
