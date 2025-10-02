const express = require("express");
const router = express.Router();

const controllers = {
  flights: require("../controllers/flights"),
};

router.use(async (req, res, next) => {
  // run any additional pre operations
  next();
});

router.use("/", controllers.flights.getAllFlights);

module.exports = router;
