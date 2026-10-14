export function isVisible(cinemaName: string, visibleChains: string[]) {
  const name = cinemaName.toLowerCase();

  const categories: { [key: string]: string[] } = {
    Multikino: ["multikino"],
    "Cinema City": ["cinema city", "imax"],
    Helios: ["helios"],
  };

  for (const [category, prefixes] of Object.entries(categories)) {
    if (prefixes.some((p) => name.startsWith(p))) {
      return visibleChains.includes(category);
    }
  }

  return true; // Independent
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  coords?: { lat: number; lng: number };
  city?: string;
}

export interface Movie {
  id: string;
  title: string;
  boxd_uri: string;
  poster?: string;
  rating?: number;
  vote_count?: number;
  runtime?: number;
  tmdb_id?: number;
  tmdb_url?: string;
  year?: number;
}

export interface Showtime {
  movie_id: string;
  cinema_id: string;
  times: string[];
}

export interface Failure {
  title: string;
  reason: string;
  details?: string;
}

export interface Metadata {
  last_scrape: string;
  total_movies: number;
  available_dates: string[];
  failures: Failure[];
}

export interface CinemaData {
  cinemas: Cinema[];
  movies: Movie[];
  showtimes: { [date: string]: Showtime[] };
  metadata: Metadata;
}

export interface Match {
  id: string;
  title: string;
  boxd_uri: string;
  poster?: string;
  rating?: number;
  vote_count?: number;
  runtime?: number;
  tmdb_id?: number;
  tmdb_url?: string;
  year?: number;
  showtimes: {
    cinema: string | undefined;
    times: string[];
    cinema_id: string;
  }[];
}

export function formatRating(rating?: number): string | null {
  if (typeof rating !== "number" || isNaN(rating) || rating <= 0) return null;
  return (Math.round(rating * 10) / 10).toFixed(1);
}

export function formatVoteCount(count?: number): string | null {
  if (typeof count !== "number" || isNaN(count) || count <= 0) return null;
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 10_000) {
    return `${Math.round(count / 1_000)}k`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}k`;
  }
  return `${count}`;
}

export function formatRuntime(runtime?: number): string | null {
  if (typeof runtime !== "number" || isNaN(runtime) || runtime <= 0)
    return null;
  return `${runtime} min`;
}

export function getTmdbUrl(
  tmdbUrl?: string,
  tmdbId?: number,
  title?: string,
): string {
  if (tmdbUrl && tmdbUrl.trim() !== "") {
    return tmdbUrl;
  }
  if (tmdbId && tmdbId > 0) {
    return `https://www.themoviedb.org/movie/${tmdbId}`;
  }
  if (title) {
    return `https://www.themoviedb.org/search/movie?query=${encodeURIComponent(title)}`;
  }
  return "https://www.themoviedb.org";
}

export function findMatchesWithFilters(
  watchlistUris: string[],
  data: CinemaData | null,
  visibleChains: string[],
  selectedDate: string,
  excludedMovieIds: string[] = [],
  excludedCinemaIds: string[] = [],
  sortBy: string = "rare-week",
  showAllScreenings: boolean = false,
): { matches: Match[]; filteredCinemas: Cinema[]; matchedCinemaIds: string[] } {
  if (!data || !selectedDate || !data.showtimes[selectedDate])
    return { matches: [], filteredCinemas: [], matchedCinemaIds: [] };

  const dailyShowtimes = data.showtimes[selectedDate];
  if (dailyShowtimes !== null && !(dailyShowtimes instanceof Array)) {
    throw new TypeError(
      "Daily showtimes should be an instance of an Array - verify scraped data structure.",
    );
  }

  const filteredCinemas = data.cinemas.filter(
    (c) =>
      isVisible(c.name, visibleChains) && !excludedCinemaIds.includes(c.id),
  );
  const filteredCinemaIds = new Set(filteredCinemas.map((c) => c.id));

  const matchingMovies = data.movies.filter(
    (movie) =>
      (showAllScreenings || watchlistUris.includes(movie.boxd_uri)) &&
      !excludedMovieIds.includes(movie.id),
  );

  const finalMatches: Match[] = matchingMovies
    .map((movie) => {
      const relevantShowtimes = dailyShowtimes.filter(
        (s) => s.movie_id === movie.id && filteredCinemaIds.has(s.cinema_id),
      );

      if (relevantShowtimes.length === 0) return null;

      return {
        ...movie,
        showtimes: relevantShowtimes.map((s) => ({
          cinema: data.cinemas.find((c) => c.id === s.cinema_id)?.name,
          times: s.times,
          cinema_id: s.cinema_id,
        })),
      };
    })
    .filter((m): m is Match => m !== null);

  // Pre-calculate screenings for sorting
  const movieScreeningsWeek: Record<string, number> = {};
  const movieScreeningsDay: Record<string, number> = {};

  if (
    sortBy === "rare-week" ||
    sortBy === "rare-day" ||
    sortBy === "most-screenings"
  ) {
    for (const match of finalMatches) {
      let weekCount = 0;
      let dayCount = 0;

      for (const [date, showtimes] of Object.entries(data.showtimes)) {
        for (const s of showtimes) {
          if (s.movie_id === match.id) {
            weekCount += s.times.length;
            if (date === selectedDate) {
              dayCount += s.times.length;
            }
          }
        }
      }
      movieScreeningsWeek[match.id] = weekCount;
      movieScreeningsDay[match.id] = dayCount;
    }

    finalMatches.sort((a, b) => {
      const aWeek = movieScreeningsWeek[a.id];
      const bWeek = movieScreeningsWeek[b.id];
      const aDay = movieScreeningsDay[a.id];
      const bDay = movieScreeningsDay[b.id];

      if (sortBy === "rare-week") {
        if (aWeek !== bWeek) return aWeek - bWeek;
        if (aDay !== bDay) return aDay - bDay;
      } else if (sortBy === "rare-day") {
        if (aDay !== bDay) return aDay - bDay;
        if (aWeek !== bWeek) return aWeek - bWeek;
      } else if (sortBy === "most-screenings") {
        if (aWeek !== bWeek) return bWeek - aWeek;
        if (aDay !== bDay) return bDay - aDay;
      }
      return a.title.localeCompare(b.title);
    });
  } else if (sortBy === "alpha-asc") {
    finalMatches.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "alpha-desc") {
    finalMatches.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortBy === "popularity-desc") {
    finalMatches.sort((a, b) => {
      const aPop = a.vote_count ?? 0;
      const bPop = b.vote_count ?? 0;
      if (aPop !== bPop) return bPop - aPop;
      return a.title.localeCompare(b.title);
    });
  } else if (sortBy === "rating-desc") {
    finalMatches.sort((a, b) => {
      const aRate = a.rating ?? 0;
      const bRate = b.rating ?? 0;
      if (aRate !== bRate) return bRate - aRate;
      const aPop = a.vote_count ?? 0;
      const bPop = b.vote_count ?? 0;
      if (aPop !== bPop) return bPop - aPop;
      return a.title.localeCompare(b.title);
    });
  } else if (sortBy === "year-desc") {
    finalMatches.sort((a, b) => {
      const aYear = a.year ?? 0;
      const bYear = b.year ?? 0;
      if (aYear !== bYear) return bYear - aYear;
      return a.title.localeCompare(b.title);
    });
  } else if (sortBy === "year-asc") {
    finalMatches.sort((a, b) => {
      const aYear = a.year && a.year > 0 ? a.year : 9999;
      const bYear = b.year && b.year > 0 ? b.year : 9999;
      if (aYear !== bYear) return aYear - bYear;
      return a.title.localeCompare(b.title);
    });
  }

  const matchedCinemaIds = Array.from(
    new Set(finalMatches.flatMap((m) => m.showtimes.map((s) => s.cinema_id))),
  );

  return {
    matches: finalMatches,
    filteredCinemas,
    matchedCinemaIds,
  };
}

export function calculateMatchCountsPerDay(
  watchlistUris: string[],
  data: CinemaData | null,
  visibleChains: string[],
  excludedMovieIds: string[] = [],
  excludedCinemaIds: string[] = [],
  showAllScreenings: boolean = false,
  selectedCinemaId: string | null = null,
  mapBounds: {
    west: number;
    south: number;
    east: number;
    north: number;
  } | null = null,
  selectedMovieId: string | null = null,
): Record<string, number> {
  const counts: Record<string, number> = {};
  if (!data || !data.showtimes) return counts;

  for (const date of Object.keys(data.showtimes)) {
    let { matches } = findMatchesWithFilters(
      watchlistUris,
      data,
      visibleChains,
      date,
      excludedMovieIds,
      excludedCinemaIds,
      "alpha-asc", // sorting doesn't matter for counting
      showAllScreenings,
    );

    if (mapBounds && !selectedCinemaId) {
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

      matches = matches
        .map((m) => ({
          ...m,
          showtimes: m.showtimes.filter((s) =>
            visibleCinemaIds.has(s.cinema_id),
          ),
        }))
        .filter((m) => m.showtimes.length > 0);
    }

    if (selectedCinemaId) {
      matches = matches
        .map((m) => ({
          ...m,
          showtimes: m.showtimes.filter(
            (s) => s.cinema_id === selectedCinemaId,
          ),
        }))
        .filter((m) => m.showtimes.length > 0);
    }

    if (selectedMovieId) {
      matches = matches.filter((m) => m.id === selectedMovieId);
    }

    counts[date] = matches.length;
  }
  return counts;
}

export function formatDateToYMD(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isScreeningPast(
  timeStr: string,
  dateOrNow?: string | Date,
  maybeNow?: Date,
): boolean {
  let dateStr: string | undefined;
  let now: Date = new Date();

  if (typeof dateOrNow === "string") {
    dateStr = dateOrNow;
    if (maybeNow instanceof Date) {
      now = maybeNow;
    }
  } else if (dateOrNow instanceof Date) {
    now = dateOrNow;
  }

  if (dateStr) {
    const todayStr = formatDateToYMD(now);
    if (dateStr < todayStr) return true;
    if (dateStr > todayStr) return false;
  }

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (isNaN(hour) || isNaN(minute)) return false;

  if (hour < currentHour) return true;
  if (hour === currentHour && minute <= currentMinute) return true;
  return false;
}

export function hasFutureScreeningsForDate(
  date: string,
  dailyShowtimes: Array<{ times: string[] }> | undefined,
  now: Date = new Date(),
): boolean {
  const todayStr = formatDateToYMD(now);
  if (date < todayStr) return false;
  if (date > todayStr)
    return (dailyShowtimes && dailyShowtimes.length > 0) ?? false;
  if (!dailyShowtimes || dailyShowtimes.length === 0) return false;

  return dailyShowtimes.some((s) =>
    s.times.some((t) => !isScreeningPast(t, now)),
  );
}

export function isDateInPast(
  dateStr: string,
  now: Date = new Date(),
  dailyShowtimes?: Array<{ times: string[] }>,
): boolean {
  const todayStr = formatDateToYMD(now);
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  if (dailyShowtimes && dailyShowtimes.length > 0) {
    return !dailyShowtimes.some((s) =>
      s.times.some((t) => !isScreeningPast(t, now)),
    );
  }
  return false;
}

export function getDefaultSelectedDate(
  dates: string[],
  showtimes?: Record<string, Array<{ times: string[] }>>,
  now: Date = new Date(),
): string {
  if (!dates || dates.length === 0) return "";

  const sortedDates = [...dates].sort();
  const todayStr = formatDateToYMD(now);

  for (const date of sortedDates) {
    if (date < todayStr) continue;
    if (date === todayStr) {
      const dailyShowtimes = showtimes ? showtimes[date] : undefined;
      if (dailyShowtimes && dailyShowtimes.length > 0) {
        const hasFuture = dailyShowtimes.some((s) =>
          s.times.some((t) => !isScreeningPast(t, now)),
        );
        if (!hasFuture) {
          continue; // Today's screenings have all passed; default to the next day
        }
      }
      return date;
    }
    return date;
  }

  return sortedDates[sortedDates.length - 1];
}

export interface CityMatchGroup {
  city: string;
  matches: Match[];
}

export function groupMatchesByCity(
  matches: Match[],
  cinemas: Cinema[],
): CityMatchGroup[] {
  const cinemaMap = new Map<string, Cinema>();
  for (const c of cinemas) {
    cinemaMap.set(c.id, c);
  }

  const cityMap = new Map<string, Map<string, Match>>();

  for (const match of matches) {
    for (const st of match.showtimes) {
      const cinema = cinemaMap.get(st.cinema_id);
      const city = cinema?.city || "Other";

      if (!cityMap.has(city)) {
        cityMap.set(city, new Map());
      }

      const moviesMap = cityMap.get(city)!;
      if (!moviesMap.has(match.id)) {
        moviesMap.set(match.id, {
          ...match,
          showtimes: [st],
        });
      } else {
        moviesMap.get(match.id)!.showtimes.push(st);
      }
    }
  }

  const groups: CityMatchGroup[] = [];
  cityMap.forEach((moviesMap, city) => {
    const cityMatches: Match[] = [];
    moviesMap.forEach((m) => cityMatches.push(m));
    groups.push({
      city,
      matches: cityMatches,
    });
  });

  groups.sort((a, b) => a.city.localeCompare(b.city, "pl"));
  return groups;
}

export function getAvailableCities(cinemas: Cinema[]): string[] {
  const citySet = new Set<string>();
  for (const c of cinemas) {
    if (c.city && c.city.trim()) {
      citySet.add(c.city.trim());
    }
  }
  return Array.from(citySet).sort((a, b) => a.localeCompare(b, "pl"));
}

export function getNearestCity(
  location: { lat: number; lng: number },
  cinemas: Cinema[],
): string | null {
  let nearestCity: string | null = null;
  let minDistance = Infinity;

  for (const cinema of cinemas) {
    if (cinema.city && cinema.coords) {
      const dist = Math.hypot(
        cinema.coords.lat - location.lat,
        cinema.coords.lng - location.lng,
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestCity = cinema.city;
      }
    }
  }
  return nearestCity;
}
