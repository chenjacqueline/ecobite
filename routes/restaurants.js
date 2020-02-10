const express = require("express");
const router = express.Router();

router.get("/restaurants", (req, res, next) => {
  axios.get("https://api.foursquare.com/v2/venues/explore").then(response => {
    res.render(test);
    res.json(response);
  });
});

module.exports = router;
