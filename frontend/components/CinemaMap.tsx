"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { Match, Cinema } from "../utils/matching_logic";

const DEFAULT_ZOOM_VALUE = 12;

interface CinemaMapProps {
  cinemas: Cinema[];
  highlightedCinemaIds?: string[];
  matches?: Match[];
  userLocation?: { lat: number; lng: number } | null;
  onLocationFound?: (loc: { lat: number; lng: number }) => void;
  onSelectCinema?: (cinemaId: string | null) => void;
}

const createMarkerIcon = (color: string, name: string, showLabel: boolean) => {
  if (typeof L === "undefined") return null;
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="marker-wrapper">
        <div class="marker-pin" style="background-color: ${color};"></div>
        ${showLabel ? `<div class="marker-label">${name}</div>` : ""}
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
};

function MapController({
  center,
  onZoomChange,
}: {
  center: [number, number] | null;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    if (center) {
      map.setView(center, DEFAULT_ZOOM_VALUE);
    }
  }, [center, map]);

  return null;
}

function MapEventsController({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
}

export default function CinemaMap({
  cinemas,
  highlightedCinemaIds = [],
  matches = [],
  userLocation,
  onLocationFound,
  onSelectCinema,
}: CinemaMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM_VALUE);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        style={{ height: "100%", width: "100%", background: "var(--lb-bg)" }}
      >
        Loading Map...
      </div>
    );
  }

  const warsawCenter: [number, number] = [52.2297, 21.0122];

  const handleLocateMe = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (onLocationFound) {
            onLocationFound({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert(
            "Could not get your location. Please check your browser permissions.",
          );
        },
      );
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        background: "var(--lb-bg)",
      }}
    >
      <div
        className="map-controls-container"
        style={{
          position: "absolute",
          bottom: "30px",
          right: "15px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "flex-end",
        }}
      >
        <button
          onClick={handleLocateMe}
          style={{
            background: "var(--lb-sidebar)",
            color: "var(--lb-blue)",
            border: "1px solid var(--lb-card)",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "1.2em",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
          title="Locate Me"
        >
          📍
        </button>
      </div>

      <MapContainer
        center={warsawCenter}
        zoom={DEFAULT_ZOOM_VALUE}
        zoomControl={false}
        style={{ height: "100%", width: "100%", background: "var(--lb-bg)" }}
      >
        <MapController
          center={userLocation ? [userLocation.lat, userLocation.lng] : null}
          onZoomChange={setZoom}
        />
        <MapEventsController
          onMapClick={() => {
            if (onSelectCinema) onSelectCinema(null);
          }}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createMarkerIcon("#40bcf4", "You", false)!}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {cinemas.map((cinema) => {
          const cinemaMatches = matches.filter((m) =>
            m.showtimes.some((s) => s.cinema_id === cinema.id),
          );

          const isHighlighted = highlightedCinemaIds.includes(cinema.id);
          const color = isHighlighted ? "#00e054" : "#ff8000";
          const icon = createMarkerIcon(color, cinema.name, zoom >= 13);

          return (
            cinema.coords &&
            icon && (
              <Marker
                key={cinema.id}
                position={[cinema.coords.lat, cinema.coords.lng]}
                icon={icon}
                eventHandlers={{
                  click: (e) => {
                    if (e.originalEvent) {
                      e.originalEvent.stopPropagation();
                    }
                    if (onSelectCinema) {
                      onSelectCinema(cinema.id);
                    }
                  },
                }}
              >
                <Popup>
                  <strong style={{ color: "var(--lb-text-primary)" }}>
                    {cinema.name}
                  </strong>
                  <br />
                  <span
                    style={{
                      color: "var(--lb-text-secondary)",
                      fontSize: "0.9em",
                    }}
                  >
                    {cinema.address}
                  </span>
                  {cinemaMatches.length > 0 && (
                    <div
                      style={{
                        marginTop: "10px",
                        borderTop: "1px solid var(--lb-card)",
                        paddingTop: "5px",
                      }}
                    >
                      <strong
                        style={{ fontSize: "0.85em", color: "var(--lb-green)" }}
                      >
                        Watchlist Matches:
                      </strong>
                      <ul
                        style={{
                          margin: "5px 0 0 0",
                          paddingLeft: "18px",
                          fontSize: "0.9em",
                        }}
                      >
                        {cinemaMatches.map((m) => (
                          <li key={m.id}>
                            <a
                              href={m.boxd_uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "var(--lb-blue)" }}
                            >
                              {m.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Popup>
              </Marker>
            )
          );
        })}
      </MapContainer>
    </div>
  );
}
