const axios = require("axios");
const api = require("./api");

const { getIO } = require("./socket");

const controller = {
  flightsController: require("../controllers/flights"),
};

async function getAllFlights(req, res) {
  try {
    /*
        /v2/hex/[hex]	GET	Return all aircraft with an exact match on one or more Mode S hex IDs (max ~1000 per request). 
        /v2/callsign/[callsign]	GET	Return all aircraft exactly matching one or more callsigns. 
        /v2/reg/[reg]	GET	Return all aircraft exactly matching one or more registrations (tail numbers). 
        /v2/type/[type]	GET	Return all aircraft having specified ICAO aircraft type codes (e.g. “A321”, “B738”, etc.). 
        /v2/squawk/[squawk]	GET	Return all aircraft currently squawking a specified transponder code. 
        /v2/mil/	GET	Returns all aircraft tagged as military. 
        /v2/ladd/	GET	Returns all aircraft tagged as LADD. (LADD = “Low Altitude Demonstration Data” / some specific tag) 
        /v2/pia/	GET	Returns all aircraft tagged as PIA (Privacy-oriented / some masking / private-or-government address) 
        /v2/point/[lat]/[lon]/[radius]	GET	Returns all aircraft within a given radius of a geographic point, up to 250 nautical miles radius. 
    */

    const response = await axios.get(
      // `https://api.adsb.one/v2/mil/`
      `https://api.adsb.one/v2/point/43.6532/-79.3832/250`
    );

    // set flights details in global.

    global.flightsData = response.data;
    controller.flightsController.notifyFlightsUpdate(global.flightsData); // tell controller to send updates
  } catch (error) {
    console.log(error);
    api.respond(req, res, 404, "Error: failed to get flights information");
  }
}

module.exports = {
  getAllFlights,
};
