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
}

export interface Movie {
  id: string;
  title: string;
  boxd_uri: string;
  poster?: string;
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
  showtimes: {
    cinema: string | undefined;
    times: string[];
    cinema_id: string;
  }[];
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
): Record<string, number> {
  const counts: Record<string, number> = {};
  if (!data || !data.showtimes) return counts;

  for (const date of Object.keys(data.showtimes)) {
    const { matches } = findMatchesWithFilters(
      watchlistUris,
      data,
      visibleChains,
      date,
      excludedMovieIds,
      excludedCinemaIds,
      "alpha-asc", // sorting doesn't matter for counting
      showAllScreenings,
    );
    counts[date] = matches.length;
  }
  return counts;
}
