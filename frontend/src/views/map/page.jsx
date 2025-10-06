"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, Pane } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { io } from "socket.io-client";
import L from "leaflet";
import { MapBounds } from "@/app/utils/map";

if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

const FlightsLayer = ({ flightsData, updateInterval = 5000 }) => {
  const map = useMap();
  const flightsRef = useRef({});

  const drawMarker = (lat, lon, icon) => {
    const longitudes = [lon, lon - 360, lon + 360];
    return longitudes.map((lng) => {
      const marker = L.marker([lat, lng], { icon }).addTo(map);
      return marker;
    });
  };

  useEffect(() => {
    if (!map) return;
    const now = Date.now();

    flightsData.forEach((f) => {
      if (!f.lat || !f.lon) return;

      const flightId = f.hex || f.flight || `${f.lat}_${f.lon}`;
      const direction = f.track || f.nav_heading || f.true_heading || 0;
      const icon = createPlaneIcon(direction);

      if (!flightsRef.current[flightId]) {
        const markers = drawMarker(f.lat, f.lon, icon);

        const popupContent = `
          <strong>Flight:</strong> ${f.flight?.trim() || "Unknown"}<br>
          <strong>Registration:</strong> ${f.r || "Unknown"}<br>
          <strong>Aircraft:</strong> ${f.desc || f.t || "Unknown"}<br>
          <strong>Altitude:</strong> ${f.alt_baro || "Unknown"} ft<br>
          <strong>Speed:</strong> ${f.gs || "Unknown"} kts<br>
          <strong>Track:</strong> ${f.track || "Unknown"}°
        `;
        markers[0].bindPopup(popupContent);

        flightsRef.current[flightId] = {
          prev: { lat: f.lat, lon: f.lon },
          next: { lat: f.lat, lon: f.lon },
          startTime: now,
          endTime: now + updateInterval,
          markers,
          flightInfo: f,
        };
      } else {
        const flight = flightsRef.current[flightId];
        flight.prev = flight.next;
        flight.next = { lat: f.lat, lon: f.lon };
        flight.startTime = now;
        flight.endTime = now + updateInterval;
        flight.flightInfo = f;

        const newIcon = createPlaneIcon(direction);

        const popupContent = `
          <strong>Flight:</strong> ${f.flight?.trim() || "Unknown"}<br>
          <strong>Registration:</strong> ${f.r || "Unknown"}<br>
          <strong>Aircraft:</strong> ${f.desc || f.t || "Unknown"}<br>
          <strong>Altitude:</strong> ${f.alt_baro || "Unknown"} ft<br>
          <strong>Speed:</strong> ${f.gs || "Unknown"} kts<br>
          <strong>Track:</strong> ${f.track || "Unknown"}°
        `;
        flight.markers[0].setPopupContent(popupContent);

        flight.markers.forEach((m, i) => {
          const lng = f.lon + (i === 1 ? -360 : i === 2 ? 360 : 0);
          m.setLatLng([f.lat, lng]);
          m.setIcon(newIcon);
        });
      }
    });

    const currentFlightIds = new Set(
      flightsData.map((f) => f.hex || f.flight || `${f.lat}_${f.lon}`)
    );
    Object.keys(flightsRef.current).forEach((flightId) => {
      if (!currentFlightIds.has(flightId)) {
        flightsRef.current[flightId].markers.forEach((m) => map.removeLayer(m));
        delete flightsRef.current[flightId];
      }
    });
  }, [flightsData, map, updateInterval]);

  useEffect(() => {
    let animFrame;
    const animate = () => {
      const now = Date.now();
      Object.values(flightsRef.current).forEach((f) => {
        const t = Math.min(1, (now - f.startTime) / (f.endTime - f.startTime));
        const lat = f.prev.lat + (f.next.lat - f.prev.lat) * t;
        const lon = f.prev.lon + (f.next.lon - f.prev.lon) * t;

        f.markers.forEach((m, i) => {
          const newLng = lon + (i === 1 ? -360 : i === 2 ? 360 : 0);
          m.setLatLng([lat, newLng]);
        });
      });
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return null;
};

const InitialBounds = ({ setBoundries }) => {
  const map = useMap();

  useEffect(() => {
    // Wait for map to be ready, then set initial bounds
    map.whenReady(() => {
      const bounds = map.getBounds();
      setBoundries({
        southWest: bounds.getSouthWest(),
        northEast: bounds.getNorthEast(),
      });
    });
  }, [map, setBoundries]);

  return null;
};

const createPlaneIcon = (heading = 0) => {
  const html = `
    <div style="
      transform: rotate(${heading}deg);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
    ">
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" 
              fill="#dc2626" 
              stroke="#000000" 
              stroke-width="1"
              stroke-linejoin="round"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createSimplePlaneIcon = (heading = 0) => {
  const html = `
    <div style="
      transform: rotate(${heading}deg);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: #dc2626;
      font-size: 18px;
      font-weight: bold;
    ">
      ✈️
    </div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const MapView = () => {
  const [boundaries, setBoundaries] = useState();
  const [flights, setFlights] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL);

    socketRef.current.on("connect", () =>
      console.log("Connected:", socketRef.current.id)
    );

    socketRef.current.on("flightsData", (data) => {
      console.log(data);
      setFlights(data.ac || []);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socketRef.current && boundaries) {
      socketRef.current.emit("flightsData", boundaries);
    }
  }, [boundaries]);

  return (
    <>
      {flights && (
        <MapContainer
          center={[43.6532, -79.3832]}
          zoom={9}
          maxBoundsViscosity={4}
          style={{ height: "100vh", width: "100%" }}
          worldCopyJump={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <InitialBounds setBoundries={setBoundaries} />
          <FlightsLayer flightsData={flights} updateInterval={2000} />
          <MapBounds setBoundries={setBoundaries} />
        </MapContainer>
      )}
    </>
  );
};

export default MapView;
