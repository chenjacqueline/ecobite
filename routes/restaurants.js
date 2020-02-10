const express = require("express");
const router = express.Router();
const axios = require("axios");
const endpoint = `https://api.foursquare.com/v2/venues/search?ll=52.5200,13.40508&radius=1000&limit=50&query=food&intent=browse&client_id=PSP5QOSRPK51TQA0HB215CWY2HVVGYHEVSS3LLICXE0ZXCZ4&client_secret=JNHCGSX0SFMEUNH1U0QTTWXPL5REZM2ACJABH2LQNQ3UQ3Z3&v=20200210`;

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

router.get("/markus", (req, res, next) => {
  getRestaurantList()
    .then(restaurantsList => {
      res.send(restaurantsList.data.response.venues); // array of objects
      res.render("test");
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
