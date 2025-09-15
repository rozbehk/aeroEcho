export async function OpenStreetGet(data) {
  console.log("get data", data);

  try {
    const response = await fetch("/api/opensky", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        southWest: data.southWest,
        northEast: data.northEast,
      }),
    });

    if (!response.ok) {
      // Only consume the response once
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.error || `HTTP error! status: ${response.status}`;
      } catch {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    // Parse the JSON only once and store it
    const result = await response.json();

    console.log("Response data:", {
      state: result.states,
      time: new Date(result.time * 1000).toISOString(),
    });

    return result;
  } catch (error) {
    console.error("Failed to fetch aircraft data:", error);
    throw error;
  }
}
