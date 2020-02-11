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

// DATA-GRABBING FUNCTIONS
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
  res.render("rating", { restaurantId: req.params.restaurantId });
});

// SUBMISSION OF SCORE FORM
router.post("/:restaurantId/score", (req, res, next) => {
  // console.log(req.body);
  let restaurantId = req.params.restaurantId;
  const scores = {
    eatIn: req.body.eatIn,
    takeAway: req.body.takeAway,
    reusableCup: req.body.reusableCup,
    veg: req.body.veg,
    dairy: req.body.dairy
  };

  Score.create({
    userID: req.user._id,
    restaurantID: restaurantId, // Foursquare, not Mongo
    scores
  })
    .then(() => {
      Restaurant.findOne({ id: restaurantId }).then(response => {
        if (!response) {
          Restaurant.create({
            id: restaurantId,
            scores
          }).then(() => {
            res.redirect("/restaurants");
          });
        } else {
          Restaurant.findByIdAndUpdate(response._id, {
            $push: { scores }
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
