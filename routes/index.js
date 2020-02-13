const express = require("express");
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
  console.log(req.user);
});

router.get("/restaurantcard", (req, res, next) => {
  res.render("partials/restaurantCard");
});

module.exports = router;
