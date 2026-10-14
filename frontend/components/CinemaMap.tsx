"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import L from "leaflet";
import { Cinema } from "../utils/matching_logic";

const DEFAULT_ZOOM_VALUE = 12;

interface CinemaMapProps {
  cinemas: Cinema[];
  highlightedCinemaIds?: string[];
  userLocation?: { lat: number; lng: number } | null;
  onLocationFound?: (loc: { lat: number; lng: number }) => void;
  onSelectCinema?: (cinemaId: string | null) => void;
  isMinimized?: boolean;
  onBoundsChange?: (
    bounds: { west: number; south: number; east: number; north: number } | null,
  ) => void;
  hasActiveMovieFilter?: boolean;
  center?: { lat: number; lng: number } | null;
  cityToFit?: string | null;
  fitBoundsCinemas?: Cinema[] | null;
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

const createUserLocationIcon = () => {
  if (typeof L === "undefined") return null;
  return L.divIcon({
    className: "user-location-marker",
    html: `
      <div style="font-size: 24px; line-height: 1; text-align: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); user-select: none;">
        📍
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 22],
    popupAnchor: [0, -20],
  });
};

function MapController({
  center,
  onZoomChange,
  cinemas,
  hasActiveMovieFilter,
  cityToFit,
  userLocation,
  fitBoundsCinemas,
  onBoundsChange,
  mapRef,
}: {
  center: [number, number] | null;
  onZoomChange: (zoom: number) => void;
  cinemas: Cinema[];
  hasActiveMovieFilter: boolean;
  cityToFit?: string | null;
  userLocation?: { lat: number; lng: number } | null;
  fitBoundsCinemas?: Cinema[] | null;
  onBoundsChange?: (
    bounds: { west: number; south: number; east: number; north: number } | null,
  ) => void;
  mapRef?: React.MutableRefObject<L.Map | null>;
}) {
  const map = useMap();
  const lastCenterRef = useRef<[number, number] | null>(null);
  const lastCityFitRef = useRef<string | null>(null);
  const initialLocationSetRef = useRef(false);
  const lastFitBoundsRef = useRef<Cinema[] | null>(null);

  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    if (center) {
      const hasChanged =
        !lastCenterRef.current ||
        lastCenterRef.current[0] !== center[0] ||
        lastCenterRef.current[1] !== center[1];

      if (hasChanged) {
        map.setView(center, 14);
        lastCenterRef.current = center;
      }
    } else {
      lastCenterRef.current = null;
    }
  }, [center, map]);

  useEffect(() => {
    if (
      userLocation &&
      !initialLocationSetRef.current &&
      !cityToFit &&
      !hasActiveMovieFilter
    ) {
      map.panTo([userLocation.lat, userLocation.lng]);
      initialLocationSetRef.current = true;
    }
  }, [userLocation, cityToFit, hasActiveMovieFilter, map]);

  useEffect(() => {
    if (
      cityToFit &&
      cityToFit !== lastCityFitRef.current &&
      cinemas.length > 0 &&
      !hasActiveMovieFilter
    ) {
      const cityCinemas = cinemas.filter(
        (c) =>
          c.city &&
          c.city.toLowerCase() === cityToFit.toLowerCase() &&
          c.coords,
      );
      if (cityCinemas.length > 0) {
        const bounds = L.latLngBounds(
          cityCinemas.map((c) => L.latLng(c.coords!.lat, c.coords!.lng)),
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        lastCityFitRef.current = cityToFit;
      }
    }
  }, [cityToFit, cinemas, hasActiveMovieFilter, map]);

  useEffect(() => {
    if (
      fitBoundsCinemas &&
      fitBoundsCinemas.length > 0 &&
      fitBoundsCinemas !== lastFitBoundsRef.current
    ) {
      lastFitBoundsRef.current = fitBoundsCinemas;
      const validCinemas = fitBoundsCinemas.filter((c) => c.coords);
      if (validCinemas.length > 0) {
        const bounds = L.latLngBounds(
          validCinemas.map((c) => L.latLng(c.coords!.lat, c.coords!.lng)),
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });

        const notifyBounds = () => {
          if (onBoundsChange) {
            const b = map.getBounds();
            onBoundsChange({
              west: b.getWest(),
              south: b.getSouth(),
              east: b.getEast(),
              north: b.getNorth(),
            });
          }
        };

        map.once("moveend", notifyBounds);
        map.once("zoomend", notifyBounds);
        const t1 = setTimeout(notifyBounds, 50);
        const t2 = setTimeout(notifyBounds, 250);
        const t3 = setTimeout(notifyBounds, 500);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          map.off("moveend", notifyBounds);
          map.off("zoomend", notifyBounds);
        };
      }
    }
  }, [fitBoundsCinemas, map, onBoundsChange]);

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

function MapBoundsController({
  onBoundsChange,
}: {
  onBoundsChange: (
    bounds: { west: number; south: number; east: number; north: number } | null,
  ) => void;
}) {
  const map = useMap();

  const updateBounds = useCallback(() => {
    const b = map.getBounds();
    onBoundsChange({
      west: b.getWest(),
      south: b.getSouth(),
      east: b.getEast(),
      north: b.getNorth(),
    });
  }, [map, onBoundsChange]);

  useEffect(() => {
    updateBounds();
  }, [updateBounds]);

  useMapEvents({
    moveend: updateBounds,
    zoomend: updateBounds,
    viewreset: updateBounds,
    resize: updateBounds,
  });

  return null;
}

export default function CinemaMap({
  cinemas,
  highlightedCinemaIds = [],
  userLocation,
  onLocationFound,
  onSelectCinema,
  isMinimized = false,
  onBoundsChange,
  hasActiveMovieFilter = false,
  center,
  cityToFit,
  fitBoundsCinemas,
}: CinemaMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM_VALUE);
  const [isMobile, setIsMobile] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const mapCenter = useMemo(() => {
    if (center) return [center.lat, center.lng] as [number, number];
    return null;
  }, [center]);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };
    checkMobile();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
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
    const notifyBounds = () => {
      if (mapRef.current && onBoundsChange) {
        const b = mapRef.current.getBounds();
        onBoundsChange({
          west: b.getWest(),
          south: b.getSouth(),
          east: b.getEast(),
          north: b.getNorth(),
        });
      }
    };

    if (userLocation) {
      if (mapRef.current) {
        mapRef.current.panTo([userLocation.lat, userLocation.lng]);
        mapRef.current.once("moveend", notifyBounds);
        setTimeout(notifyBounds, 50);
        setTimeout(notifyBounds, 250);
      }
      if (onLocationFound) {
        onLocationFound(userLocation);
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          if (mapRef.current) {
            mapRef.current.panTo([loc.lat, loc.lng]);
            mapRef.current.once("moveend", notifyBounds);
            setTimeout(notifyBounds, 50);
            setTimeout(notifyBounds, 250);
          }
          if (onLocationFound) {
            onLocationFound(loc);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          if (!userLocation) {
            alert(
              "Could not get your location. Please check your browser permissions.",
            );
          }
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
          bottom: isMobile ? (isMinimized ? "80px" : "220px") : "30px",
          right: "15px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "flex-end",
          transition: "bottom 0.3s ease-in-out",
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
          center={mapCenter}
          onZoomChange={setZoom}
          cinemas={cinemas}
          hasActiveMovieFilter={hasActiveMovieFilter}
          cityToFit={cityToFit}
          userLocation={userLocation}
          fitBoundsCinemas={fitBoundsCinemas}
          onBoundsChange={onBoundsChange}
          mapRef={mapRef}
        />
        <MapEventsController
          onMapClick={() => {
            if (onSelectCinema) onSelectCinema(null);
          }}
        />
        {onBoundsChange && (
          <MapBoundsController onBoundsChange={onBoundsChange} />
        )}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${process.env.NEXT_PUBLIC_CARTO_API_KEY ?? ""}`}
        />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserLocationIcon()!}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {cinemas.map((cinema) => {
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
              ></Marker>
            )
          );
        })}
      </MapContainer>
    </div>
  );
}
