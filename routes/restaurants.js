const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/restaurants", (req, res, next) => {
  console.log("REST");
  res.render("restaurants");
});

// DATA-GRABBING FUNCTIONS
function getRestaurantList() {
  return axios
    .get(`http://api.coindesk.com/v1/bpi/historical/close.json`)
    .then(response => {
      console.log(response);
      return response;
    })
    .catch(err => {
      console.log(err);
    });
}

//https://api.foursquare.com/v2/venues/explore?client_id=f5a60750e73a48e48972e328f134e63a&client_secret=71c5f7ca1b1b4c138aac376fef5462a7&v=20180323&limit=20&ll=52.5200,13.40508&query=food

router.get("/markus", (req, res, next) => {
  console.log("Hellesfsefesfesefso");
  getRestaurantList();
  //.then(restaurantsList => {
  //res.send(restaurantsList);
  //res.render("test");
  //});
});

module.exports = router;
