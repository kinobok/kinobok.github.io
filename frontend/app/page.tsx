"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import JSZip from "jszip";
import { findMatchesWithFilters } from "../utils/matching_logic";
import { parseWatchlist } from "../utils/csv_parser";
import GuidanceModal from "../components/GuidanceModal";
import SearchBar from "../components/SearchBar";
import ConfigMenu from "../components/ConfigMenu";

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
  const [showGuidance, setShowGuidance] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((json) => setData(json));

    // 1. Hydrate watchlist from localStorage
    const savedUris = localStorage.getItem("kinobok_watchlist_uris");
    if (savedUris) {
      try {
        setWatchlistUris(JSON.parse(savedUris));
      } catch (e) {
        console.error("Failed to parse saved watchlist", e);
      }
    }

    // 2. Check guidance visibility
    const hasSeenGuidance = localStorage.getItem("kinobok_guidance_seen");
    if (!hasSeenGuidance && !savedUris) {
      setShowGuidance(true);
    }
  }, []);

  const handleCloseGuidance = () => {
    setShowGuidance(false);
    localStorage.setItem("kinobok_guidance_seen", "true");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let csvText = "";

    if (file.name.endsWith(".zip")) {
      try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);
        const watchlistFile = Object.keys(contents.files).find((path) =>
          path.endsWith("watchlist.csv"),
        );

        if (watchlistFile) {
          csvText = await contents.files[watchlistFile].async("text");
        } else {
          alert(
            "Error: 'watchlist.csv' not found in the uploaded ZIP. Please ensure you are uploading the full Letterboxd export. If you believe this is a bug, please raise an issue at: https://github.com/kinobok/kinobok.github.io/issues/",
          );
          return;
        }
      } catch (error) {
        console.error("Error unzipping file:", error);
        alert(
          "Failed to process ZIP file. Please try uploading the CSV directly.",
        );
        return;
      }
    } else {
      csvText = await file.text();
    }

    const uris = parseWatchlist(csvText);
    setWatchlistUris(uris);

    // Save to localStorage
    localStorage.setItem("kinobok_watchlist_uris", JSON.stringify(uris));
    setIsMenuOpen(false);
  };

  const { matches, filteredCinemas, matchedCinemaIds } = useMemo(() => {
    let result = findMatchesWithFilters(watchlistUris, data, visibleChains);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      // Filter matches by title or cinema name
      result.matches = result.matches.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.showtimes.some((s) => s.cinema.toLowerCase().includes(q)),
      );
      // Filter cinemas by name (for display on map)
      result.filteredCinemas = result.filteredCinemas.filter((c) =>
        c.name.toLowerCase().includes(q),
      );
    }

    return result;
  }, [watchlistUris, data, visibleChains, searchQuery]);

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
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        position: "relative",
      }}
    >
      {showGuidance && <GuidanceModal onClose={handleCloseGuidance} />}

      <SearchBar
        onMenuToggle={() => setIsMenuOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ConfigMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        visibleChains={visibleChains}
        onToggleChain={handleToggleChain}
        handleFileUpload={handleFileUpload}
      />

      <MatchSidebar
        matches={matches}
        isExpanded={isSidebarExpanded}
        onToggleExpand={setIsSidebarExpanded}
      />

      <div style={{ flex: 1, position: "relative" }}>
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
