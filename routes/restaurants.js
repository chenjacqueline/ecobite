const express = require("express");
const router = express.Router();
const axios = require("axios");
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const endpoint = `https://api.foursquare.com/v2/venues/search?ll=52.5200,13.40508&radius=2000&limit=20&query=food&intent=browse&client_id=${clientId}&client_secret=${clientSecret}&v=20200210`;

router.get("/restaurants", (req, res, next) => {
  console.log("REST");
  res.render("restaurants");
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

router.get("/test", (req, res, next) => {
  res.render("test");
});

router.get("/testData", (req, res, next) => {
  getRestaurantList()
    .then(restaurantsList => {
      // res.json(restaurantsList.data.response.venues); // array of objects
      res.json(restaurantsList.data.response.venues);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
