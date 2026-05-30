import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF, InfoWindowF } from "@react-google-maps/api";

const STADIUM_COORDS = {
  "Narendra Modi Stadium Ahmedabad": { lat: 23.0919, lng: 72.5975 },
  "Wankhede Stadium Mumbai": { lat: 18.9389, lng: 72.8258 },
  "M Chinnaswamy Stadium Bengaluru": { lat: 12.9786, lng: 77.5987 },
  "Rajiv Gandhi International Stadium Hyderabad": { lat: 17.4065, lng: 78.5505 },
  "Arun Jaitley Stadium Delhi": { lat: 28.6379, lng: 77.2432 }
};

const USER_START_COORDS = {
  "Narendra Modi Stadium Ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "Wankhede Stadium Mumbai": { lat: 19.0176, lng: 72.8561 },
  "M Chinnaswamy Stadium Bengaluru": { lat: 12.9279, lng: 77.6271 },
  "Rajiv Gandhi International Stadium Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Arun Jaitley Stadium Delhi": { lat: 28.5355, lng: 77.3910 }
};

const GATE_COORDS = {
  "Narendra Modi Stadium Ahmedabad": {
    "Gate A": { lat: 23.0929, lng: 72.5955 },
    "Gate B": { lat: 23.0909, lng: 72.5995 },
    "VIP Gate": { lat: 23.0949, lng: 72.5975 }
  },
  "Wankhede Stadium Mumbai": {
    "Gate A": { lat: 18.9379, lng: 72.8248 },
    "Gate B": { lat: 18.9399, lng: 72.8268 },
    "VIP Gate": { lat: 18.9369, lng: 72.8258 }
  },
  "M Chinnaswamy Stadium Bengaluru": {
    "Gate A": { lat: 12.9776, lng: 77.5977 },
    "Gate B": { lat: 12.9796, lng: 77.5997 },
    "VIP Gate": { lat: 12.9766, lng: 77.5987 }
  },
  "Rajiv Gandhi International Stadium Hyderabad": {
    "Gate A": { lat: 17.4055, lng: 78.5495 },
    "Gate B": { lat: 17.4075, lng: 78.5515 },
    "VIP Gate": { lat: 17.4045, lng: 78.5505 }
  },
  "Arun Jaitley Stadium Delhi": {
    "Gate A": { lat: 28.6369, lng: 77.2422 },
    "Gate B": { lat: 28.6389, lng: 77.2442 },
    "VIP Gate": { lat: 28.6359, lng: 77.2432 }
  }
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "400px"
};

export default function StadiumMap({ stadium, gateTimes }) {
  const [apiKey, setApiKey] = React.useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "");
  const [loading, setLoading] = React.useState(!apiKey);

  React.useEffect(() => {
    if (!apiKey) {
      fetch("/api/config")
        .then(res => res.json())
        .then(data => {
          if (data.google_maps_api_key) {
            setApiKey(data.google_maps_api_key);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("[STADIUM_MAP] Failed to fetch Google Maps API key from backend:", err);
          setLoading(false);
        });
    }
  }, [apiKey]);

  if (loading) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-[#090d16] text-[#38bdf8] p-4 text-center rounded-xl border border-[#1e293b]">
        <span className="material-symbols-outlined text-4xl mb-2 animate-spin">sync</span>
        <p className="font-label text-xs uppercase tracking-widest text-[#94a3b8] mt-2">Loading Map Configuration...</p>
      </div>
    );
  }

  return <StadiumMapInner stadium={stadium} gateTimes={gateTimes} googleMapsApiKey={apiKey} />;
}

function StadiumMapInner({ stadium, gateTimes: externalGateTimes, googleMapsApiKey }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: googleMapsApiKey || ""
  });

  const [localGateTimes, setLocalGateTimes] = useState(externalGateTimes || {
    "Gate A": 15,
    "Gate B": 15,
    "VIP Gate": 15
  });

  const [selectedGate, setSelectedGate] = useState(null);

  // Sync external props wait times
  useEffect(() => {
    if (externalGateTimes) {
      setLocalGateTimes(externalGateTimes);
    }
  }, [externalGateTimes]);

  // Subscribe to live WebSocket /ws/crowd telemetry
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host || "localhost:8000";
    const wsUrl = `${protocol}//${host}/ws/crowd?stadium=${encodeURIComponent(stadium)}`;
    
    console.log("[STADIUM_MAP] Connecting to crowd WS:", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if ((message.type === "initial_data" || message.type === "crowd_update") && message.data) {
          console.log("[STADIUM_MAP] WebSocket crowd update received:", message.data);
          setLocalGateTimes(prev => ({
            ...prev,
            ...message.data
          }));
        }
      } catch (err) {
        console.error("[STADIUM_MAP] WebSocket parse error:", err);
      }
    };

    return () => {
      console.log("[STADIUM_MAP] Closing crowd WS subscription for:", stadium);
      ws.close();
    };
  }, [stadium]);

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#090d16] text-[#ef4444] p-4 text-center">
        <span className="material-symbols-outlined text-4xl mb-2">error</span>
        <p className="font-headline font-bold text-sm">Failed to Load Google Maps SDK</p>
        <p className="font-body text-xs mt-1 text-[#94a3b8]">{loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#090d16] text-[#38bdf8] p-4 text-center">
        <span className="material-symbols-outlined text-4xl mb-2 animate-spin">sync</span>
        <p className="font-label text-xs uppercase tracking-widest text-[#94a3b8] mt-2">Initializing Google Maps View...</p>
      </div>
    );
  }

  const userCenter = USER_START_COORDS[stadium] || { lat: 18.9389, lng: 72.8258 };
  const stadiumCenter = STADIUM_COORDS[stadium] || { lat: 18.9389, lng: 72.8258 };
  const gates = GATE_COORDS[stadium] || {};

  // Center between User and Stadium to fit both in view
  const mapCenter = {
    lat: (userCenter.lat + stadiumCenter.lat) / 2,
    lng: (userCenter.lng + stadiumCenter.lng) / 2
  };

  const polylinePath = [userCenter, stadiumCenter];

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={13}
      options={{
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0b0f19" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f19" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#74889e" }] },
          { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#5468ff" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#38bdf8" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#070a13" }] }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false
      }}
    >
      {/* User Current Location Marker */}
      <MarkerF
        position={userCenter}
        title="Your Location"
        icon={{
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }}
      />

      {/* Stadium Location Marker */}
      <MarkerF
        position={stadiumCenter}
        title={stadium}
        icon={{
          url: "https://maps.google.com/mapfiles/ms/icons/sportvenue.png"
        }}
      />

      {/* Route Polyline User -> Stadium */}
      <PolylineF
        path={polylinePath}
        options={{
          strokeColor: "#38bdf8",
          strokeOpacity: 0.8,
          strokeWeight: 4,
          geodesic: true
        }}
      />

      {/* Gate Entrance Markers */}
      {Object.entries(gates).map(([gateName, position]) => {
        const waitTime = localGateTimes[gateName] || 15;
        const density = Math.min(1.0, waitTime / 45.0);

        // Green marker: density_score <0.3
        // Yellow marker: density_score 0.3–0.7
        // Red marker: density_score >0.7
        let markerIconUrl = "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
        if (density < 0.3) {
          markerIconUrl = "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
        } else if (density > 0.7) {
          markerIconUrl = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
        }

        const isRecommended = gateName === Object.keys(localGateTimes).sort((a, b) => (localGateTimes[a] || 0) - (localGateTimes[b] || 0))[0];

        return (
          <MarkerF
            key={gateName}
            position={position}
            title={gateName}
            icon={{
              url: markerIconUrl
            }}
            onClick={() => setSelectedGate({
              name: gateName,
              position: position,
              waitTime: waitTime,
              density: density,
              isRecommended: isRecommended
            })}
          />
        );
      })}

      {/* Info Window on Clicking Gate */}
      {selectedGate && (
        <InfoWindowF
          position={selectedGate.position}
          onCloseClick={() => setSelectedGate(null)}
        >
          <div className="p-1 text-slate-900 max-w-[180px] font-sans">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-tight">{selectedGate.name}</h4>
            <div className="mt-1 text-[10px] text-slate-600 space-y-0.5">
              <p>Wait Time: <span className="font-bold text-slate-950">{selectedGate.waitTime} mins</span></p>
              <p>Density Score: <span className="font-bold text-slate-950">{selectedGate.density.toFixed(2)}</span></p>
            </div>
            {selectedGate.isRecommended ? (
              <p className="mt-2 text-[8px] bg-green-100 text-green-800 px-1.5 py-0.5 font-bold uppercase tracking-wide rounded inline-block">
                ★ Recommended Gate
              </p>
            ) : (
              <p className="mt-2 text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 font-medium uppercase tracking-wide rounded inline-block">
                Alternative Entry
              </p>
            )}
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
