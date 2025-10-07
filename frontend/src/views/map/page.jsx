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

const getCategoryIcon = (category, heading = 0, size = [25, 25]) => {
  console.log(category);
  const iconUrl = `/icons/${category || "default"}.svg`;

  // Create a rotated divIcon wrapper for the image
  const html = `
    <div style="
      transform: rotate(${heading}deg);
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${size[0]}px;
      height: ${size[1]}px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    ">
      <img src="${iconUrl}" style="width: 100%; height: 100%;" />
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
  });
};

const FlightsLayer = ({ flightsData, updateInterval = 5000 }) => {
  const map = useMap();
  const flightsRef = useRef({});

  const drawMarker = (lat, lon, icon) => {
    const longitudes = [lon, lon - 360, lon + 360];
    return longitudes.map((lng) => L.marker([lat, lng], { icon }).addTo(map));
  };

  useEffect(() => {
    if (!map) return;
    const now = Date.now();

    flightsData.forEach((f) => {
      if (!f.lat || !f.lon) return;

      const flightId = f.hex || f.flight || `${f.lat}_${f.lon}`;
      const heading = f.track || f.true_heading || 0; // Get heading from track or true_heading
      const icon = getCategoryIcon(f.category, heading);

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
          heading: heading,
        };
      } else {
        const flight = flightsRef.current[flightId];
        flight.prev = flight.next;
        flight.next = { lat: f.lat, lon: f.lon };
        flight.startTime = now;
        flight.endTime = now + updateInterval;
        flight.flightInfo = f;
        flight.heading = heading;

        const newIcon = getCategoryIcon(f.category, heading);

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

    // Remove old flights
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

  // Animate flight movement
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
