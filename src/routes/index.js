const express = require("express");
const router = express.Router();

const routes = {
  flights: require("./flights"),
};

router.use(async (req, res, next) => {
  next();
});

router.use("/flights", routes.flights);

module.exports = router;
