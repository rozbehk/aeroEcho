let ioInstance = null;
const api = require("../modules/api");

async function getAllFlights(req, res, next) {
  try {
    return res.status(200).json(global.flighsData.ac);
  } catch (error) {
    next(error);
  }
}

function initFlightSockets(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("flightsData", (bounds) => {
      console.log(bounds);
      socket.bounds = bounds;

      // Send initial filtered flights
      if (global.flightsData) {
        const filtered = filterFlightsByBounds(global.flightsData, bounds);
        socket.emit("flightsData", { ac: filtered });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

function filterFlightsByBounds(flights, bounds) {
  if (!bounds) return flights;
  return flights.ac.filter(
    (flight) =>
      flight.lat <= bounds.northEast.lat &&
      flight.lat >= bounds.southWest.lat &&
      flight.lon <= bounds.northEast.lng &&
      flight.lon >= bounds.southWest.lng
  );
}

function notifyFlightsUpdate(flights) {
  if (!ioInstance) return;

  ioInstance.sockets.sockets.forEach((socket) => {
    if (socket.bounds) {
      const filtered = filterFlightsByBounds(flights, socket.bounds);
      socket.emit("flightsData", { ac: filtered });
    }
  });
}

module.exports = {
  getAllFlights,
  initFlightSockets,
  notifyFlightsUpdate,
};
