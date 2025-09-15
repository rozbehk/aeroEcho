import axios from "axios";
import { NextResponse } from "next/server";

let accessToken = null;
let tokenExpiry = null;

// Server-side - no NEXT_PUBLIC_ prefix needed
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

async function getAccessToken() {
  console.log("Server-side env check:", {
    hasClientId: !!CLIENT_ID,
    hasClientSecret: !!CLIENT_SECRET,
  });

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing OAuth credentials in server environment");
  }

  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    console.log("Requesting new OAuth2 token...");

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

    console.log(`✅ OAuth2 token acquired, expires in ${expiresIn} seconds`);
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

export async function POST(request) {
  try {
    const body = await request.json();
    const { southWest, northEast } = body;

    const params = {
      lamin: southWest?.lat || 40,
      lamax: northEast?.lat || 50,
      lonmin: southWest?.lng || -10,
      lonmax: northEast?.lng || 10,
    };

    console.log("API Parameters:", params);

    const token = await getAccessToken();

    const response = await axios.get(
      `https://opensky-network.org/api/states/all?lamin=${southWest?.lat}&lamax=${northEast?.lat}&lomin=${southWest?.lng}&lomax=${northEast?.lng}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "NextJS-App/1.0",
        },
        timeout: 30000,
      }
    );

    console.log("✅ Authenticated request successful");
    console.log("Response data:", {
      statesCount: response.data.states || 0,
      time: new Date(response.data.time * 1000).toISOString(),
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("❌ API Request failed:", error.message);
    return NextResponse.json(
      {
        error: error.message,
        details: error.response?.data,
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({
    message: "OpenSky API endpoint is working",
    timestamp: new Date().toISOString(),
  });
}
