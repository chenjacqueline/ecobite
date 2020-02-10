const express = require("express");
const router = express.Router();

router.get("/restaurants", (req, res, next) => {
  return axios
    .get("https://api.foursquare.com/v2/venues/explore")
    .then(response => {
      console.log(response);
      res.render(test);
    });
});

module.exports = router;
