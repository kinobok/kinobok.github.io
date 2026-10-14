"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo, useCallback } from "react";
import JSZip from "jszip";
import {
  findMatchesWithFilters,
  calculateMatchCountsPerDay,
  CinemaData,
  isScreeningPast,
  getDefaultSelectedDate,
  isDateInPast,
  getAvailableCities,
  getNearestCity,
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
  const [defaultCity, setDefaultCity] = useState<string>("Warszawa");
  const [cityToFit, setCityToFit] = useState<string | null>(null);
  const [isLocationActive, setIsLocationActive] = useState<boolean>(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [mapBounds, setMapBounds] = useState<{
    west: number;
    south: number;
    east: number;
    north: number;
  } | null>(null);

  const selectedCinema = useMemo(() => {
    if (!selectedCinemaId || !data?.cinemas) return null;
    return data.cinemas.find((c) => c.id === selectedCinemaId) || null;
  }, [selectedCinemaId, data]);
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
    fetch("/data_go.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        if (json.showtimes) {
          const dates = Object.keys(json.showtimes).sort();
          if (dates.length > 0) {
            setSelectedDate(getDefaultSelectedDate(dates, json.showtimes));
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

    const useLocationDefault =
      localStorage.getItem("kinobok_use_location_default") === "true";
    const savedCity = localStorage.getItem("kinobok_default_city");
    const savedLoc = localStorage.getItem("kinobok_default_location");

    if (useLocationDefault || (!savedCity && savedLoc)) {
      setIsLocationActive(true);
      setCityToFit(null);
      if (savedLoc) {
        try {
          const parsedLoc = JSON.parse(savedLoc);
          if (
            parsedLoc &&
            typeof parsedLoc.lat === "number" &&
            typeof parsedLoc.lng === "number"
          ) {
            setUserLocation(parsedLoc);
          }
        } catch (e) {
          console.error("Failed to parse saved location", e);
        }
      }

      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const freshLoc = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setUserLocation(freshLoc);
            setIsLocationActive(true);
            setCityToFit(null);
            localStorage.setItem(
              "kinobok_default_location",
              JSON.stringify(freshLoc),
            );
            localStorage.setItem("kinobok_use_location_default", "true");
          },
          (err) => {
            console.warn("Auto-geolocation on load error:", err);
          },
        );
      }
    } else if (savedCity) {
      setDefaultCity(savedCity);
      setCityToFit(savedCity);
      setIsLocationActive(false);
    } else {
      setDefaultCity("Warszawa");
      setCityToFit("Warszawa");
      setIsLocationActive(false);
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

  // On load, if location is used as default, adjust initial zoom to the nearest city's cinemas
  useEffect(() => {
    if (
      isLocationActive &&
      userLocation &&
      data?.cinemas &&
      data.cinemas.length > 0 &&
      !cityToFit
    ) {
      const nearest = getNearestCity(userLocation, data.cinemas);
      if (nearest) {
        setCityToFit(nearest);
        setDefaultCity(nearest);
      }
    }
  }, [isLocationActive, userLocation, data?.cinemas, cityToFit]);

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

  const handleLocationFound = useCallback(
    (loc: { lat: number; lng: number }) => {
      setUserLocation(loc);
      setIsLocationActive(true);
      setCityToFit(null);
      localStorage.setItem("kinobok_use_location_default", "true");
      localStorage.setItem("kinobok_default_location", JSON.stringify(loc));
      localStorage.removeItem("kinobok_default_city");
      setSelectedCinemaId(null);
      setSelectedMovieId(null);
      setSearchQuery("");
      setIsSidebarMinimized(false);
    },
    [],
  );

  const handleSelectCity = useCallback((city: string) => {
    setDefaultCity(city);
    setCityToFit(city);
    setIsLocationActive(false);
    setUserLocation(null);
    setSelectedCinemaId(null);
    setSelectedMovieId(null);
    setSearchQuery("");
    localStorage.setItem("kinobok_default_city", city);
    localStorage.removeItem("kinobok_default_location");
    localStorage.setItem("kinobok_use_location_default", "false");
  }, []);

  const handleLocateMe = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          handleLocationFound(loc);
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert(
            "Could not get your location. Please check your browser permissions.",
          );
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, [handleLocationFound]);

  const availableCities = useMemo(() => {
    return getAvailableCities(data?.cinemas || []);
  }, [data?.cinemas]);

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

  const handleToggleCinemas = (cinemaIds: string[]) => {
    const allExcluded = cinemaIds.every((id) => excludedCinemaIds.includes(id));
    let newExcluded: string[];
    if (allExcluded) {
      newExcluded = excludedCinemaIds.filter((id) => !cinemaIds.includes(id));
    } else {
      const set = new Set([...excludedCinemaIds, ...cinemaIds]);
      newExcluded = Array.from(set);
    }
    setExcludedCinemaIds(newExcluded);
    localStorage.setItem(
      "kinobok_excluded_cinemas",
      JSON.stringify(newExcluded),
    );
  };

  const handleSelectCinema = (cinemaId: string | null) => {
    setSelectedCinemaId(cinemaId);
    if (cinemaId !== null) {
      setSelectedMovieId(null);
    } else {
      setSelectedMovieId(null);
    }
    if (cinemaId === null) {
      setIsSidebarMinimized(false);
      setSearchQuery("");
    } else {
      setIsSidebarMinimized(false);
      setIsSidebarExpanded(false);
      if (data?.cinemas) {
        const cinema = data.cinemas.find((c) => c.id === cinemaId);
        if (cinema) {
          setSearchQuery(cinema.name);
        }
      }
    }
  };

  const handleSelectMovie = (movieId: string | null) => {
    setSelectedMovieId(movieId);
    if (movieId !== null) {
      setSelectedCinemaId(null);
    }
    if (movieId === null) {
      setIsSidebarMinimized(false);
      setSearchQuery("");
    } else {
      setIsSidebarMinimized(false);
      setIsSidebarExpanded(false);
      if (data?.movies) {
        const movie = data.movies.find((m) => m.id === movieId);
        if (movie) {
          setSearchQuery(movie.title);
        }
      }
    }
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
      selectedCinemaId,
      mapBounds,
      selectedMovieId,
    );
  }, [
    watchlistUris,
    data,
    visibleChains,
    excludedMovieIds,
    excludedCinemaIds,
    showAllScreenings,
    selectedCinemaId,
    mapBounds,
    selectedMovieId,
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

    // Apply Map Bounds filtering (unless selectedCinemaId is set to override)
    if (mapBounds && !selectedCinemaId && data) {
      const visibleCinemaIds = new Set(
        data.cinemas
          .filter(
            (c) =>
              c.coords &&
              c.coords.lat >= mapBounds.south &&
              c.coords.lat <= mapBounds.north &&
              c.coords.lng >= mapBounds.west &&
              c.coords.lng <= mapBounds.east,
          )
          .map((c) => c.id),
      );

      result.matches = result.matches
        .map((m) => ({
          ...m,
          showtimes: m.showtimes.filter((s) =>
            visibleCinemaIds.has(s.cinema_id),
          ),
        }))
        .filter((m) => m.showtimes.length > 0);

      result.filteredCinemas = result.filteredCinemas.filter((c) =>
        visibleCinemaIds.has(c.id),
      );
    }

    // Apply Selected Movie filtering
    if (selectedMovieId && data) {
      const showtimesForDate = data.showtimes[selectedDate] || [];
      const movieCinemaIds = new Set(
        showtimesForDate
          .filter((st) => st.movie_id === selectedMovieId)
          .map((st) => st.cinema_id),
      );

      const selectedMovie = data.movies.find((m) => m.id === selectedMovieId);
      if (selectedMovie) {
        const movieShowtimes = showtimesForDate
          .filter((st) => st.movie_id === selectedMovieId)
          .map((st) => {
            const cinema = data.cinemas.find((c) => c.id === st.cinema_id);
            return {
              cinema: cinema?.name,
              cinema_id: st.cinema_id,
              times: st.times,
            };
          });

        result.matches = [
          {
            id: selectedMovie.id,
            title: selectedMovie.title,
            boxd_uri: selectedMovie.boxd_uri,
            poster: selectedMovie.poster,
            showtimes: movieShowtimes,
          },
        ];
      } else {
        result.matches = [];
      }

      result.filteredCinemas = data.cinemas.filter((c) =>
        movieCinemaIds.has(c.id),
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

    // For today's date, push movies with no remaining future screenings to the bottom
    const todayStr = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })();

    if (selectedDate === todayStr) {
      const hasFutureScreening = (m: (typeof result.matches)[0]) => {
        return m.showtimes.some((s) =>
          s.times.some((t) => !isScreeningPast(t)),
        );
      };

      result.matches.sort((a, b) => {
        const aHasFuture = hasFutureScreening(a);
        const bHasFuture = hasFutureScreening(b);
        if (aHasFuture && !bHasFuture) return -1;
        if (!aHasFuture && bHasFuture) return 1;
        return 0;
      });
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
    mapBounds,
    selectedMovieId,
  ]);

  const visibleMovies = useMemo(() => {
    if (!data) return [];
    const dailyShowtimes = data.showtimes[selectedDate] || [];
    const activeMovieIds = new Set(dailyShowtimes.map((st) => st.movie_id));
    return data.movies.filter(
      (m) => activeMovieIds.has(m.id) && !excludedMovieIds.includes(m.id),
    );
  }, [data, selectedDate, excludedMovieIds]);

  const isDatePast = useCallback(
    (dateStr: string) => {
      return isDateInPast(dateStr, new Date(), data?.showtimes?.[dateStr]);
    },
    [data?.showtimes],
  );

  if (!data) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--lb-bg)",
          gap: "16px",
        }}
      >
        <img
          src="/kinobok.svg"
          alt="kinobok"
          className="loading-logo"
          style={{ width: "120px", height: "auto" }}
        />
        <div style={{ color: "var(--lb-text-secondary)", fontSize: "0.95em" }}>
          Loading...
        </div>
      </div>
    );
  }

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
        availableCities={availableCities}
        selectedCity={defaultCity}
        onSelectCity={handleSelectCity}
        onLocateMe={handleLocateMe}
        isLocationActive={isLocationActive}
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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        allCinemas={filteredCinemas}
        allMovies={visibleMovies}
        onSelectCinema={handleSelectCinema}
        onSelectMovie={handleSelectMovie}
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
        onToggleCinemas={handleToggleCinemas}
        excludedMovieIds={excludedMovieIds}
        allMovies={data.movies}
        onRestoreMovie={handleRestoreMovie}
        showAllScreenings={showAllScreenings}
        onToggleShowAllScreenings={handleToggleShowAllScreenings}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        availableCities={availableCities}
        defaultCity={defaultCity}
        onSelectDefaultCity={handleSelectCity}
        onLocateMe={handleLocateMe}
        isLocationActive={isLocationActive}
        onDashboardToggle={() => {
          setShowDashboard(true);
          setIsMenuOpen(false);
        }}
      />

      <MatchSidebar
        matches={matches}
        allCinemas={data.cinemas}
        isExpanded={isSidebarExpanded}
        onToggleExpand={(val) => {
          setIsSidebarExpanded(val);
          if (val) {
            setIsSidebarMinimized(false);
          }
        }}
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
        selectedCinema={selectedCinema}
        isDatePast={isDatePast}
      />

      <div style={{ flex: 1, position: "relative" }}>
        <CinemaMap
          cinemas={filteredCinemas}
          highlightedCinemaIds={matchedCinemaIds}
          userLocation={userLocation}
          onLocationFound={handleLocationFound}
          onSelectCinema={handleSelectCinema}
          isMinimized={isSidebarMinimized}
          onBoundsChange={setMapBounds}
          hasActiveMovieFilter={!!selectedMovieId}
          center={selectedCinema ? selectedCinema.coords : null}
          cityToFit={cityToFit}
        />
      </div>
    </main>
  );
}
