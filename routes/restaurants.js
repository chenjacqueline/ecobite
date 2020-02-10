const express = require("express");
const router = express.Router();

class APIHandler {
  constructor(baseUrl) {
    this.BASE_URL = baseUrl;
  }

  getRestaurantList() {
    return axios
      .get(
        `https://api.foursquare.com/v2/venues/explore?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&v=20180323&limit=20&ll=52.5200,13.40508&query=food`
      )
      .then(response => {
        // Code for handling API response
        return response;
      })
      .catch(err => {
        // Code for handling errors
        console.log(err);
      });
  }
}

const restaurantsAPI = new APIHandler("http://localhost:3000");

router.get("/test", (req, res, next) => {
  restaurantsAPI
    .restaurantList()
    .then(response => {
      console.log(response);
      res.render("test");
    })
    .catch(err => {
      // Code for handling errors
      console.log(err);
    });
});

module.exports = router;
