export async function getFlightsApi(data) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/flights`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
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

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error("Failed to fetch aircraft data:", error);
    throw error;
  }
}
