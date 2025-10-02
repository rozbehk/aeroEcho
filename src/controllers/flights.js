const axios = require("axios");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing OAuth credentials in server environment");
  }

  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 15000,
      }
    );

    accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in || 3600;
    tokenExpiry = Date.now() + expiresIn * 1000 - 60000;

    return accessToken;
  } catch (error) {
    console.error("❌ Failed to get OAuth2 token:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(`OAuth2 authentication failed: ${error.message}`);
  }
}

async function getAllFlights(req, res) {
  try {
    const response = await axios.get(
      `https://api.adsb.one/v2/point/43.6532/-79.3832/250`
    );
    console.log(response);

    return res.status(200).json(response.data.ac);
  } catch (error) {
    return res.status(404).message("Error: failed to get flights information");
  }
}

module.exports = {
  getAllFlights,
};
