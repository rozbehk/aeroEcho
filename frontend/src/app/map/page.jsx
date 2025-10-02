"use client";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/views/map/page"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f0f0",
      }}
    >
      Loading map...
    </div>
  ),
});

const Map = () => {
  return <MapView />;
};

export default Map;
