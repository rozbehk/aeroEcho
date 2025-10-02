const axios = require("axios");

// stores/flightStore.js
class FlightStore {
  constructor() {
    this.flights = new Map(); // flightId -> flightData
    this.lastUpdated = new Map(); // flightId -> timestamp
    this.subscribers = new Set(); // callback functions
    this.updateInterval = null;
    this.isUpdating = false;
    this.lastApiCall = 0; // Track last API call time
    this.minApiInterval = 1000; // 1 second between API calls
  }

  getFlight(flightId) {
    return this.flights.get(flightId) || null;
  }

  getAllFlights() {
    return Object.fromEntries(this.flights);
  }

  setFlight(flightId, flightData) {
    const oldData = this.flights.get(flightId);
    this.flights.set(flightId, flightData);
    this.lastUpdated.set(flightId, new Date());

    this.notifySubscribers("flightUpdated", {
      flightId,
      oldData,
      newData: flightData,
    });

    if (global.emitFlightUpdate) {
      global.emitFlightUpdate(flightId, flightData);
    }
    return flightData;
  }

  setFlights(flightsData) {
    Object.entries(flightsData).forEach(([flightId, flightData]) => {
      this.setFlight(flightId, flightData);
    });
  }

  removeFlight(flightId) {
    const removed = this.flights.delete(flightId);
    this.lastUpdated.delete(flightId);

    if (removed) {
      this.notifySubscribers("flightRemoved", { flightId });
    }
    return removed;
  }

  isFlightStale(flightId, maxAgeMs = 60000) {
    const lastUpdate = this.lastUpdated.get(flightId);
    if (!lastUpdate) return true;
    return Date.now() - lastUpdate.getTime() > maxAgeMs;
  }

  getStaleFlights(maxAgeMs = 60000) {
    return Array.from(this.flights.keys()).filter((flightId) =>
      this.isFlightStale(flightId, maxAgeMs)
    );
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(event, data) {
    this.subscribers.forEach((cb) => {
      try {
        cb(event, data);
      } catch (err) {
        console.error("Error in subscriber:", err);
      }
    });
  }

  startAutoUpdates(intervalMs = 1000) {
    if (this.updateInterval) {
      console.log("Auto updates already running");
      return;
    }

    if (intervalMs < this.minApiInterval) {
      console.warn(
        `⚠️ Interval ${intervalMs}ms < API rate limit. Adjusting to ${this.minApiInterval}ms`
      );
      intervalMs = this.minApiInterval;
    }

    console.log(`🚀 Starting flight auto-updates every ${intervalMs}ms`);

    // Do first update immediately
    this.updateAllFlights().catch((err) =>
      console.error("Initial update failed:", err)
    );

    // Safe async interval
    this.updateInterval = setInterval(() => {
      this.updateAllFlights().catch((err) =>
        console.error("Auto update failed:", err)
      );
    }, intervalMs);
  }

  stopAutoUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log("Stopped auto-updates");
    }
  }

  async updateAllFlights() {
    if (this.isUpdating) {
      console.log("Update already in progress, skipping...");
      return;
    }
    this.isUpdating = true;

    try {
      // Rate limiting
      const now = Date.now();
      const elapsed = now - this.lastApiCall;
      if (elapsed < this.minApiInterval) {
        await new Promise((res) =>
          setTimeout(res, this.minApiInterval - elapsed)
        );
      }

      this.lastApiCall = Date.now();
      console.log("📡 Fetching flights from API...");
      const flightsData = await this.fetchMultipleFlightsFromAPI();

      if (flightsData && typeof flightsData === "object") {
        global.emitFlightUpdate(flightsData);
        // const changedFlights = [];

        // for (const [flightId, flightData] of Object.entries(flightsData)) {
        //   const oldData = this.flights.get(flightId);
        //   if (!oldData || this.hasFlightDataChanged(oldData, flightData)) {
        //     this.setFlight(flightId, flightData);
        //     changedFlights.push(flightId);
        //   }
        // }

        // this.notifySubscribers("allFlightsUpdated", {
        //   totalFlights: Object.keys(flightsData).length,
        //   changedFlights: changedFlights.length,
        //   updatedFlightIds: changedFlights,
        //   timestamp: new Date(),
        // });
      }
    } catch (err) {
      console.error("❌ Error updating flights:", err);
      this.notifySubscribers("updateError", {
        error: err.message,
        timestamp: new Date(),
      });
      if (global.io) {
        global.io.emit("flightUpdateError", {
          error: err.message,
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      this.isUpdating = false;
    }
  }

  hasFlightDataChanged(oldData, newData) {
    const fields = [
      "status",
      "gate",
      "departure",
      "arrival",
      "delay",
      "terminal",
    ];
    return fields.some(
      (field) =>
        JSON.stringify(oldData[field]) !== JSON.stringify(newData[field])
    );
  }

  // ===========================
  // API calls (mocked here)
  // ===========================
  async fetchMultipleFlightsFromAPI(flightIds = []) {
    try {
      // If you always fetch all flights near Toronto, you can ignore flightIds
      const response = await axios.get(
        "https://api.adsb.one/v2/point/43.6532/-79.3832/10"
      );

      // The ADSB API likely returns an array of flights, not keyed by ID
      // console.log("======================");
      // console.log(flightsArray);
      // Convert to an object keyed by ICAO or flightId
      const flightsData = response.data.ac || [];
      const flightsMap = [];
      Object.entries(flightsData).forEach(([flightId, flightData]) => {
        flightsMap.push({
          flightId: flightData.flightId || flightId,
          callsign: flightData.callsign?.trim() || null,
          registration: flightData.registration || null,
          type: flightData.type || null,
          desc: flightData.desc || null,
          altitude: flightData.altitude || null,
          lat: flightData.lat || null,
          lon: flightData.lon || null,
          track: flightData.track || null,
          lastSeen: flightData.lastSeen || Date.now(),
        });
      });
      console.log("==============================");
      console.log(flightsMap);
      console.log("==============================");
      return flightsMap;
    } catch (err) {
      console.error("❌ Error fetching flights from ADSB:", err.message);
      return {};
    }
  }

  async fetchFlightFromAPI(flightId) {
    const result = await this.fetchMultipleFlightsFromAPI([flightId]);
    return result[flightId];
  }

  async getActiveFlightIds() {
    return this.flights.size > 0
      ? Array.from(this.flights.keys())
      : ["FL001", "FL002", "FL003"];
  }

  async addMultipleFlights(flightIds) {
    const data = await this.fetchMultipleFlightsFromAPI(flightIds);
    const results = {};
    for (const id of flightIds) {
      if (data[id]) {
        this.setFlight(id, data[id]);
        results[id] = data[id];
      } else {
        results[id] = null;
      }
    }
    return results;
  }

  async initializeWithFlights(flightIds = null) {
    if (!flightIds) {
      flightIds = await this.getActiveFlightIds();
    }
    if (flightIds.length === 0) return;

    await this.addMultipleFlights(flightIds);
    this.notifySubscribers("storeInitialized", {
      flightCount: flightIds.length,
      flights: flightIds,
    });
  }

  // ===========================
  // Utils
  // ===========================
  getStats() {
    const stale = this.getStaleFlights().length;
    return {
      totalFlights: this.flights.size,
      staleFlights: stale,
      freshFlights: this.flights.size - stale,
      isAutoUpdating: !!this.updateInterval,
      isUpdating: this.isUpdating,
      subscribers: this.subscribers.size,
    };
  }

  clear() {
    this.flights.clear();
    this.lastUpdated.clear();
    this.notifySubscribers("storeCleared", {});
  }
}

// Singleton
const flightStore = new FlightStore();
module.exports = flightStore;
