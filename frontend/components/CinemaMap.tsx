import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { Match } from '../utils/matching_logic';

// Leaflet marker icons are notoriously tricky in Next.js
// We use unpkg as a reliable CDN for the default assets
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const HighlightedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const UserIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CinemaMapProps {
  cinemas: Array<{
    id: string;
    name: string;
    address: string;
    coords?: {
      lat: number;
      lng: number;
    };
  }>;
  highlightedCinemaIds?: string[];
  matches?: Match[];
  userLocation?: { lat: number; lng: number } | null;
  onLocationFound?: (loc: { lat: number; lng: number }) => void;
}

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function CinemaMap({ 
  cinemas, 
  highlightedCinemaIds = [], 
  matches = [],
  userLocation,
  onLocationFound
}: CinemaMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div style={{ height: '100%', width: '100%', background: '#eee' }}>Loading Map...</div>;
  }

  const warsawCenter: [number, number] = [52.2297, 21.0122];

  const handleLocateMe = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (onLocationFound) {
            onLocationFound({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("Could not get your location. Please check your browser permissions.");
        }
      );
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <button
        onClick={handleLocateMe}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'white',
          border: '2px solid rgba(0,0,0,0.2)',
          borderRadius: '4px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        📍 Locate Me
      </button>

      <MapContainer 
        center={warsawCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapController center={userLocation ? [userLocation.lat, userLocation.lng] : null} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {cinemas.map((cinema) => {
          const cinemaMatches = matches.filter(m => 
            m.showtimes.some(s => s.cinema_id === cinema.id)
          );

          return cinema.coords && (
            <Marker 
              key={cinema.id} 
              position={[cinema.coords.lat, cinema.coords.lng]}
              icon={highlightedCinemaIds.includes(cinema.id) ? HighlightedIcon : DefaultIcon}
            >
              <Popup>
                <strong>{cinema.name}</strong><br />
                {cinema.address}
                {cinemaMatches.length > 0 && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '5px' }}>
                    <strong style={{ fontSize: '0.85em' }}>Watchlist Matches:</strong>
                    <ul style={{ margin: '5px 0 0 0', paddingLeft: '18px', fontSize: '0.9em' }}>
                      {cinemaMatches.map(m => (
                        <li key={m.id}>
                          <a href={m.boxd_uri} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>
                            {m.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
