const express = require("express");
const router = express.Router();
const api = require("../modules/api");
const controllers = {
  flightsController: require("../controllers/flights"),
};

router.use(async (req, res, next) => {
  // run any additional pre operations
  next();
});

router.get("/", controllers.flightsController.getAllFlights);

module.exports = router;
