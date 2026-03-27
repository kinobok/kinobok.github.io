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

export interface Match {
  id: string;
  title: string;
  boxd_uri: string;
  showtimes: {
    cinema: string | undefined;
    times: string[];
    cinema_id: string;
  }[];
}

export function findMatchesWithFilters(
  watchlistUris: string[],
  data: any,
  visibleChains: string[],
): { matches: Match[]; filteredCinemas: any[]; matchedCinemaIds: string[] } {
  if (!data) return { matches: [], filteredCinemas: [], matchedCinemaIds: [] };

  const filteredCinemas = data.cinemas.filter((c: any) =>
    isVisible(c.name, visibleChains),
  );
  const filteredCinemaIds = new Set(filteredCinemas.map((c: any) => c.id));

  const matchingMovies = data.movies.filter((movie: any) =>
    watchlistUris.includes(movie.boxd_uri),
  );

  const finalMatches: Match[] = matchingMovies
    .map((movie: any) => {
      const relevantShowtimes = data.showtimes.filter(
        (s: any) => s.movie_id === movie.id && filteredCinemaIds.has(s.cinema_id),
      );

      if (relevantShowtimes.length === 0) return null;

      return {
        ...movie,
        showtimes: relevantShowtimes.map((s: any) => ({
          cinema: data.cinemas.find((c: any) => c.id === s.cinema_id)?.name,
          times: s.times,
          cinema_id: s.cinema_id,
        })),
      };
    })
    .filter((m: any): m is Match => m !== null);

  const matchedCinemaIds = Array.from(
    new Set(finalMatches.flatMap((m) => m.showtimes.map((s) => s.cinema_id))),
  );

  return {
    matches: finalMatches,
    filteredCinemas,
    matchedCinemaIds,
  };
}
