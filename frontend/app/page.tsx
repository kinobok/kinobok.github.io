"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { findMatchesWithFilters } from "../utils/matching_logic";

// Dynamically import the map component to avoid SSR issues with Leaflet
const CinemaMap = dynamic(() => import("../components/CinemaMap"), {
  ssr: false,
});
const MatchSidebar = dynamic(() => import("../components/MatchSidebar"), {
  ssr: false,
});

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [watchlistUris, setWatchlistUris] = useState<string[]>([]);
  const [visibleChains, setVisibleChains] = useState<string[]>(["Helios"]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  const { matches, filteredCinemas, matchedCinemaIds } = useMemo(() => {
    return findMatchesWithFilters(watchlistUris, data, visibleChains);
  }, [watchlistUris, data, visibleChains]);

  const handleToggleChain = (chain: string) => {
    setVisibleChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  };

  const handleLocationFound = (loc: { lat: number; lng: number }) => {
    setUserLocation(loc);
  };

  if (!data) return <div>Loading kinꚘbok Warsaw...</div>;

  return (
    <main
      className="main-container"
      style={{ height: "100vh", width: "100vw", display: "flex" }}
    >
      <MatchSidebar
        matches={matches}
        visibleChains={visibleChains}
        onWatchlistUpload={setWatchlistUris}
        onToggleChain={handleToggleChain}
      />
      <div style={{ flex: 1 }}>
        <CinemaMap
          cinemas={filteredCinemas}
          highlightedCinemaIds={matchedCinemaIds}
          matches={matches}
          userLocation={userLocation}
          onLocationFound={handleLocationFound}
        />
      </div>
    </main>
  );
}
