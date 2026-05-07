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

export interface CinemaData {
  cinemas: Cinema[];
  movies: Movie[];
  showtimes: { [date: string]: Showtime[] };
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
): { matches: Match[]; filteredCinemas: Cinema[]; matchedCinemaIds: string[] } {
  if (!data || !selectedDate || !data.showtimes[selectedDate])
    return { matches: [], filteredCinemas: [], matchedCinemaIds: [] };

  const dailyShowtimes = data.showtimes[selectedDate];

  const filteredCinemas = data.cinemas.filter((c) =>
    isVisible(c.name, visibleChains),
  );
  const filteredCinemaIds = new Set(filteredCinemas.map((c) => c.id));

  const matchingMovies = data.movies.filter((movie) =>
    watchlistUris.includes(movie.boxd_uri),
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

  const matchedCinemaIds = Array.from(
    new Set(finalMatches.flatMap((m) => m.showtimes.map((s) => s.cinema_id))),
  );

  return {
    matches: finalMatches,
    filteredCinemas,
    matchedCinemaIds,
  };
}
