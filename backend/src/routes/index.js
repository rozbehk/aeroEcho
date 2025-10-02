const express = require("express");
const router = express.Router();
const api = require("../modules/api");

const routes = {
  flights: require("./flights"),
};

router.use(async (req, res, next) => {
  // run any additional pre operations
  next();
});

router.use("/flights", routes.flights);

module.exports = router;
