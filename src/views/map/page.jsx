"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createRotatedFlightIcon, MapBounds } from "@/app/utils/map";
import { OpenStreetGet } from "@/app/api/Api";

// Example usage component
const MapView = () => {
  const [bounderies, setBoundries] = useState();
  const [flights, setFlights] = useState();
  const sampleMarkers = [
    {
      lat: 51.505,
      lng: -0.09,
      popup: "<b>London</b><br>Capital of England",
    },
    {
      lat: 51.51,
      lng: -0.1,
      popup: "<b>Westminster</b><br>Government district",
    },
  ];

  useEffect(() => {
    console.log("Boundaries updated:", bounderies);
    if (bounderies) {
      getFlights();
      console.log(bounderies);
    }
  }, [bounderies]); // Add bounderies as dependency

  const getFlights = async () => {
    await OpenStreetGet(bounderies).then((resp) => {
      console.log(resp);
      setFlights(resp.states);
    });
    console.log("flights:", flights);
  };

  const position = [43.6792, -79.6178];
  return (
    <MapContainer
      center={[43.6532, -79.3832]} // Toronto
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {flights &&
        flights.map((flight, index) => {
          console.log(flight);
          const position = [flight[6], flight[5]];
          return (
            <Marker
              icon={createRotatedFlightIcon(flight)}
              key={index}
              position={position}
            >
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          );
        })}
      <MapBounds setBoundries={setBoundries} />
    </MapContainer>
  );
};

export default MapView;
