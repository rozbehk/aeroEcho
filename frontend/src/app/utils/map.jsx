import { useMap } from "react-leaflet";
import { useEffect } from "react";
import FlightIcon from "@mui/icons-material/Flight";
import { renderToString } from "react-dom/server";
import { divIcon } from "leaflet";

export function MapBounds({ setBoundries }) {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      console.log("Map Bounds:", bounds);

      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();

      const data = {
        southWest,
        northEast,
      };

      console.log(data);
      setBoundries(data);
    };

    map.on("moveend", handleMoveEnd);

    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [map, setBoundries]);

  return null;
}

export const createRotatedFlightIcon = (flight) => {
  const heading = flight.track || 0;
  const velocity = flight.gs || 0;
  const altitude = flight.alt_baro || 0;

  let iconColor = "#FFD700";
  if (altitude < 1000) {
    iconColor = "#FFC107";
  } else if (velocity > 250) {
    iconColor = "#F9A825";
  }

  const iconHtml = renderToString(
    <div
      style={{
        padding: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FlightIcon
        style={{
          fill: "#754d40ff",
          fontSize: 20,
          transform: `rotate(${heading}deg)`,
          display: "block",
          transition: "transform 0.3s ease",
          // filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.5))",
        }}
      />
    </div>
  );

  return divIcon({
    html: iconHtml,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
    className: "rotated-flight-icon",
  });
};
