const express = require("express");
const router = express.Router();

// DATA-GRABBING FUNCTIONS
function getRestaurantList() {
  return axios
    .get(
      `https://api.foursquare.com/v2/venues/explore?client_id=f5a60750e73a48e48972e328f134e63a&client_secret=71c5f7ca1b1b4c138aac376fef5462a7&v=20180323&limit=20&ll=52.5200,13.40508&query=food`
    )
    .then(response => {
      console.log(response);
    });
}

router.get("/restaurants", (req, res, next) => {
  res.render("restaurants");
});

router.get("/test", (req, res, next) => {
  getRestaurantList().then(restaurantsList => {
    res.send(restaurantsList);
    res.render("test");
  });
});

module.exports = router;
