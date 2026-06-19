"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import JSZip from "jszip";
import {
  findMatchesWithFilters,
  calculateMatchCountsPerDay,
  CinemaData,
} from "../utils/matching_logic";
import { parseWatchlist } from "../utils/csv_parser";
import GuidanceModal from "../components/GuidanceModal";
import DashboardModal from "../components/DashboardModal";
import UpdateReminderModal from "../components/UpdateReminderModal";
import { shouldShowReminder } from "../utils/watchlist_reminder_helper";
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
  const [data, setData] = useState<CinemaData | null>(null);
  const [watchlistUris, setWatchlistUris] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [visibleChains, setVisibleChains] = useState<string[]>(["Helios"]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [lastUploadDateString, setLastUploadDateString] = useState("");

  // New Sort and Filter States
  const [sortBy, setSortBy] = useState<string>("rare-week");
  const [excludedMovieIds, setExcludedMovieIds] = useState<string[]>([]);
  const [excludedCinemaIds, setExcludedCinemaIds] = useState<string[]>([]);
  const [showAllScreenings, setShowAllScreenings] = useState<boolean>(true);

  // Onboarding & Error Handling States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        if (json.showtimes) {
          const dates = Object.keys(json.showtimes).sort();
          if (dates.length > 0) {
            setSelectedDate(dates[0]);
          }
        }
      });

    // Hydrate states from localStorage
    let hasWatchlist = false;
    const savedUris = localStorage.getItem("kinobok_watchlist_uris");
    if (savedUris) {
      try {
        const parsed = JSON.parse(savedUris);
        setWatchlistUris(parsed);
        if (parsed && parsed.length > 0) {
          hasWatchlist = true;
        }
      } catch (e) {
        console.error("Failed to parse saved watchlist", e);
      }
    }

    const savedShowAll = localStorage.getItem("kinobok_show_all_screenings");
    if (savedShowAll !== null) {
      setShowAllScreenings(savedShowAll === "true");
    } else {
      setShowAllScreenings(!hasWatchlist);
    }

    const savedSortBy = localStorage.getItem("kinobok_sort_by");
    if (savedSortBy) setSortBy(savedSortBy);

    const savedExcludedMovies = localStorage.getItem("kinobok_excluded_movies");
    if (savedExcludedMovies) {
      try {
        setExcludedMovieIds(JSON.parse(savedExcludedMovies));
      } catch (e) {
        console.error("Failed to parse saved excluded movies", e);
      }
    }

    const savedExcludedCinemas = localStorage.getItem(
      "kinobok_excluded_cinemas",
    );
    if (savedExcludedCinemas) {
      try {
        setExcludedCinemaIds(JSON.parse(savedExcludedCinemas));
      } catch (e) {
        console.error("Failed to parse saved excluded cinemas", e);
      }
    }

    // Check guidance and reminder visibility
    const hasSeenGuidance = localStorage.getItem("kinobok_guidance_seen");
    if (!hasSeenGuidance && !savedUris) {
      setShowGuidance(true);
    } else if (hasWatchlist) {
      const uploadTimeStr = localStorage.getItem(
        "kinobok_watchlist_upload_time",
      );
      const snoozeTimeStr = localStorage.getItem(
        "kinobok_watchlist_snooze_time",
      );
      const uploadTime = uploadTimeStr ? parseInt(uploadTimeStr, 10) : null;
      const snoozeTime = snoozeTimeStr ? parseInt(snoozeTimeStr, 10) : null;

      if (uploadTime) {
        const dateObj = new Date(uploadTime);
        setLastUploadDateString(dateObj.toISOString().split("T")[0]);

        if (shouldShowReminder(uploadTime, snoozeTime, Date.now())) {
          setShowReminder(true);
        }
      }
    }
  }, []);

  const processUploadedFile = async (file: File) => {
    setIsProcessing(true);
    setUploadError("");
    try {
      let csvText = "";

      if (file.name.endsWith(".zip")) {
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);
        const watchlistFile = Object.keys(contents.files).find((path) =>
          path.endsWith("watchlist.csv"),
        );

        if (watchlistFile) {
          csvText = await contents.files[watchlistFile].async("text");
        } else {
          throw new Error(
            "Error: 'watchlist.csv' not found in the uploaded ZIP. Please ensure you are uploading the full Letterboxd export.",
          );
        }
      } else if (file.name.endsWith(".csv")) {
        csvText = await file.text();
      } else {
        throw new Error(
          "Invalid file type. Please upload a .csv or .zip file.",
        );
      }

      const uris = parseWatchlist(csvText);
      setWatchlistUris(uris);

      const now = Date.now();
      localStorage.setItem("kinobok_watchlist_uris", JSON.stringify(uris));
      localStorage.setItem("kinobok_watchlist_upload_time", String(now));
      setLastUploadDateString(new Date(now).toISOString().split("T")[0]);

      setShowAllScreenings(false);
      localStorage.setItem("kinobok_show_all_screenings", "false");

      // Success: Close guidance and reset errors
      setShowGuidance(false);
      localStorage.setItem("kinobok_guidance_seen", "true");

      // Close reminder if active
      setShowReminder(false);
    } catch (error) {
      console.error("Error processing file:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to process watchlist file.";
      setUploadError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBrowseWithoutWatchlist = () => {
    setShowAllScreenings(true);
    localStorage.setItem("kinobok_show_all_screenings", "true");
    setShowGuidance(false);
    localStorage.setItem("kinobok_guidance_seen", "true");
  };

  const handleCloseReminder = () => {
    localStorage.setItem("kinobok_watchlist_snooze_time", String(Date.now()));
    setShowReminder(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
    setIsMenuOpen(false);
  };

  const handleToggleChain = (chain: string) => {
    setVisibleChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  };

  const handleLocationFound = (loc: { lat: number; lng: number }) => {
    setUserLocation(loc);
  };

  // State Updates with Persistence
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    localStorage.setItem("kinobok_sort_by", newSortBy);
  };

  const handleExcludeMovie = (movieId: string) => {
    const newExcluded = [...excludedMovieIds, movieId];
    setExcludedMovieIds(newExcluded);
    localStorage.setItem(
      "kinobok_excluded_movies",
      JSON.stringify(newExcluded),
    );
  };

  const handleRestoreMovie = (movieId: string) => {
    const newExcluded = excludedMovieIds.filter((id) => id !== movieId);
    setExcludedMovieIds(newExcluded);
    localStorage.setItem(
      "kinobok_excluded_movies",
      JSON.stringify(newExcluded),
    );
  };

  const handleRestoreAllMovies = () => {
    setExcludedMovieIds([]);
    localStorage.setItem("kinobok_excluded_movies", JSON.stringify([]));
  };

  const handleToggleCinema = (cinemaId: string) => {
    let newExcluded;
    if (excludedCinemaIds.includes(cinemaId)) {
      newExcluded = excludedCinemaIds.filter((id) => id !== cinemaId);
    } else {
      newExcluded = [...excludedCinemaIds, cinemaId];
    }
    setExcludedCinemaIds(newExcluded);
    localStorage.setItem(
      "kinobok_excluded_cinemas",
      JSON.stringify(newExcluded),
    );
  };

  const handleToggleShowAllScreenings = (val: boolean) => {
    setShowAllScreenings(val);
    localStorage.setItem("kinobok_show_all_screenings", String(val));
  };

  const matchCounts = useMemo(() => {
    return calculateMatchCountsPerDay(
      watchlistUris,
      data,
      visibleChains,
      excludedMovieIds,
      excludedCinemaIds,
      showAllScreenings,
    );
  }, [
    watchlistUris,
    data,
    visibleChains,
    excludedMovieIds,
    excludedCinemaIds,
    showAllScreenings,
  ]);

  const { matches, filteredCinemas, matchedCinemaIds } = useMemo(() => {
    const result = findMatchesWithFilters(
      watchlistUris,
      data,
      visibleChains,
      selectedDate,
      excludedMovieIds,
      excludedCinemaIds,
      sortBy,
      showAllScreenings,
    );

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result.matches = result.matches.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.showtimes.some((s) => s.cinema?.toLowerCase().includes(q)),
      );
      result.filteredCinemas = result.filteredCinemas.filter((c) =>
        c.name.toLowerCase().includes(q),
      );
    }

    if (selectedCinemaId) {
      result.matches = result.matches
        .map((m) => ({
          ...m,
          showtimes: m.showtimes.filter(
            (s) => s.cinema_id === selectedCinemaId,
          ),
        }))
        .filter((m) => m.showtimes.length > 0);
    }

    return result;
  }, [
    watchlistUris,
    data,
    visibleChains,
    searchQuery,
    selectedCinemaId,
    selectedDate,
    excludedMovieIds,
    excludedCinemaIds,
    sortBy,
    showAllScreenings,
  ]);

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
      <GuidanceModal
        isOpen={showGuidance}
        onUpload={processUploadedFile}
        onBrowseWithoutWatchlist={handleBrowseWithoutWatchlist}
        error={uploadError}
        isProcessing={isProcessing}
      />

      <UpdateReminderModal
        isOpen={showReminder}
        lastUploadDate={lastUploadDateString}
        onClose={handleCloseReminder}
        onUpload={processUploadedFile}
      />

      <DashboardModal
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
        metadata={data?.metadata}
      />

      <SearchBar
        onMenuToggle={() => setIsMenuOpen(true)}
        onDashboardToggle={() => setShowDashboard(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        allCinemas={data?.cinemas}
        onSelectCinema={(cinemaId) => {
          setSelectedCinemaId(cinemaId);
          if (cinemaId === null) {
            setIsSidebarMinimized(true);
          }
        }}
      />

      <ConfigMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        visibleChains={visibleChains}
        onToggleChain={handleToggleChain}
        handleFileUpload={handleFileUpload}
        allCinemas={data.cinemas}
        excludedCinemaIds={excludedCinemaIds}
        onToggleCinema={handleToggleCinema}
        excludedMovieIds={excludedMovieIds}
        allMovies={data.movies}
        onRestoreMovie={handleRestoreMovie}
        showAllScreenings={showAllScreenings}
        onToggleShowAllScreenings={handleToggleShowAllScreenings}
      />

      <MatchSidebar
        matches={matches}
        isExpanded={isSidebarExpanded}
        onToggleExpand={(val) => {
          setIsSidebarExpanded(val);
          if (val) {
            setIsSidebarMinimized(false);
          }
        }}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onExcludeMovie={handleExcludeMovie}
        excludedCount={excludedMovieIds.length}
        onRestoreAllMovies={handleRestoreAllMovies}
        dates={data?.showtimes ? Object.keys(data.showtimes).sort() : undefined}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        matchCounts={matchCounts}
        showAllScreenings={showAllScreenings}
        onToggleShowAllScreenings={handleToggleShowAllScreenings}
        isMinimized={isSidebarMinimized}
        onToggleMinimize={setIsSidebarMinimized}
      />

      <div style={{ flex: 1, position: "relative" }}>
        <CinemaMap
          cinemas={filteredCinemas}
          highlightedCinemaIds={matchedCinemaIds}
          matches={matches}
          userLocation={userLocation}
          onLocationFound={handleLocationFound}
          onSelectCinema={(cinemaId) => {
            setSelectedCinemaId(cinemaId);
            if (cinemaId === null) {
              setIsSidebarMinimized(true);
            }
          }}
        />
      </div>
    </main>
  );
}
