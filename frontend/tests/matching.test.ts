import { describe, it, expect } from "vitest";
import { parseWatchlist } from "../utils/csv_parser";
import {
  isVisible,
  findMatchesWithFilters,
  calculateMatchCountsPerDay,
  isScreeningPast,
  formatDateToYMD,
  hasFutureScreeningsForDate,
  isDateInPast,
  getDefaultSelectedDate,
  groupMatchesByCity,
  getAvailableCities,
  getNearestCity,
  getMovieScreeningDates,
  formatChipDate,
  formatRating,
  formatVoteCount,
  formatRuntime,
  getTmdbUrl,
  Cinema,
  Movie,
  Showtime,
  CinemaData,
} from "../utils/matching_logic";

describe("findMatchesWithFilters", () => {
  const mockData: CinemaData = {
    movies: [
      { id: "m1", title: "Movie B", boxd_uri: "https://boxd.it/uri1" },
      { id: "m2", title: "Movie A", boxd_uri: "https://boxd.it/uri2" },
      { id: "m3", title: "Movie C", boxd_uri: "https://boxd.it/uri3" },
    ],
    cinemas: [
      { id: "c1", name: "Cinema 1", address: "Address 1" },
      { id: "c2", name: "Cinema 2", address: "Address 2" },
    ],
    showtimes: {
      "2026-05-07": [
        { movie_id: "m1", cinema_id: "c1", times: ["12:00"] },
        { movie_id: "m2", cinema_id: "c1", times: ["14:00", "16:00"] },
        { movie_id: "m3", cinema_id: "c2", times: ["10:00"] },
      ],
      "2026-05-08": [
        { movie_id: "m1", cinema_id: "c1", times: ["12:00", "15:00"] }, // m1 week=3, m2 week=2
      ],
    },
    metadata: {
      last_scrape: "",
      total_movies: 3,
      available_dates: ["2026-05-07", "2026-05-08"],
      failures: [],
    },
  };

  const allUris = [
    "https://boxd.it/uri1",
    "https://boxd.it/uri2",
    "https://boxd.it/uri3",
  ];

  it("should find matches for a specific date", () => {
    const result = findMatchesWithFilters(allUris, mockData, [], "2026-05-07");
    expect(result.matches).toHaveLength(3);
  });

  it("should return empty if date is missing in showtimes", () => {
    const result = findMatchesWithFilters(allUris, mockData, [], "2026-05-09");
    expect(result.matches).toHaveLength(0);
  });

  it("should filter out excluded movies", () => {
    const result = findMatchesWithFilters(
      allUris,
      mockData,
      [],
      "2026-05-07",
      ["m1"], // exclude m1
    );
    expect(result.matches).toHaveLength(2);
    expect(result.matches.some((m) => m.id === "m1")).toBe(false);
  });

  it("should filter out excluded cinemas and drop movies only in that cinema", () => {
    const result = findMatchesWithFilters(
      allUris,
      mockData,
      [],
      "2026-05-07",
      [],
      ["c2"], // exclude c2
    );
    // m3 is only in c2 on 2026-05-07, so it should be dropped
    expect(result.matches).toHaveLength(2);
    expect(result.matches.some((m) => m.id === "m3")).toBe(false);
  });

  it("should sort by rare-week (default)", () => {
    const result = findMatchesWithFilters(
      allUris,
      mockData,
      [],
      "2026-05-07",
      [],
      [],
      "rare-week",
    );
    // m1: week 3, day 1
    // m2: week 2, day 2
    // m3: week 1, day 1
    // Expected order: m3, m2, m1
    expect(result.matches[0].id).toBe("m3");
    expect(result.matches[1].id).toBe("m2");
    expect(result.matches[2].id).toBe("m1");
  });

  it("should sort alphabetically", () => {
    const result = findMatchesWithFilters(
      allUris,
      mockData,
      [],
      "2026-05-07",
      [],
      [],
      "alpha-asc",
    );
    expect(result.matches[0].title).toBe("Movie A");
    expect(result.matches[1].title).toBe("Movie B");
    expect(result.matches[2].title).toBe("Movie C");
  });

  it("should sort by popularity (vote_count descending)", () => {
    const dataWithSortFields: CinemaData = {
      ...mockData,
      movies: [
        {
          id: "m1",
          title: "Movie B",
          boxd_uri: "https://boxd.it/uri1",
          vote_count: 50,
        },
        {
          id: "m2",
          title: "Movie A",
          boxd_uri: "https://boxd.it/uri2",
          vote_count: 500,
        },
        {
          id: "m3",
          title: "Movie C",
          boxd_uri: "https://boxd.it/uri3",
          vote_count: 200,
        },
      ],
    };
    const result = findMatchesWithFilters(
      allUris,
      dataWithSortFields,
      [],
      "2026-05-07",
      [],
      [],
      "popularity-desc",
    );
    expect(result.matches[0].id).toBe("m2"); // 500
    expect(result.matches[1].id).toBe("m3"); // 200
    expect(result.matches[2].id).toBe("m1"); // 50
  });

  it("should sort by rating (highest rated first)", () => {
    const dataWithSortFields: CinemaData = {
      ...mockData,
      movies: [
        {
          id: "m1",
          title: "Movie B",
          boxd_uri: "https://boxd.it/uri1",
          rating: 6.8,
        },
        {
          id: "m2",
          title: "Movie A",
          boxd_uri: "https://boxd.it/uri2",
          rating: 8.9,
        },
        {
          id: "m3",
          title: "Movie C",
          boxd_uri: "https://boxd.it/uri3",
          rating: 7.4,
        },
      ],
    };
    const result = findMatchesWithFilters(
      allUris,
      dataWithSortFields,
      [],
      "2026-05-07",
      [],
      [],
      "rating-desc",
    );
    expect(result.matches[0].id).toBe("m2"); // 8.9
    expect(result.matches[1].id).toBe("m3"); // 7.4
    expect(result.matches[2].id).toBe("m1"); // 6.8
  });

  it("should sort by year of production (newest and oldest first)", () => {
    const dataWithSortFields: CinemaData = {
      ...mockData,
      movies: [
        {
          id: "m1",
          title: "Movie B",
          boxd_uri: "https://boxd.it/uri1",
          year: 1999,
        },
        {
          id: "m2",
          title: "Movie A",
          boxd_uri: "https://boxd.it/uri2",
          year: 2024,
        },
        {
          id: "m3",
          title: "Movie C",
          boxd_uri: "https://boxd.it/uri3",
          year: 2010,
        },
      ],
    };
    const resultNewest = findMatchesWithFilters(
      allUris,
      dataWithSortFields,
      [],
      "2026-05-07",
      [],
      [],
      "year-desc",
    );
    expect(resultNewest.matches[0].id).toBe("m2"); // 2024
    expect(resultNewest.matches[1].id).toBe("m3"); // 2010
    expect(resultNewest.matches[2].id).toBe("m1"); // 1999

    const resultOldest = findMatchesWithFilters(
      allUris,
      dataWithSortFields,
      [],
      "2026-05-07",
      [],
      [],
      "year-asc",
    );
    expect(resultOldest.matches[0].id).toBe("m1"); // 1999
    expect(resultOldest.matches[1].id).toBe("m3"); // 2010
    expect(resultOldest.matches[2].id).toBe("m2"); // 2024
  });

  it("should return all movies when showAllScreenings is true even if watchlist is empty", () => {
    const result = findMatchesWithFilters(
      [], // empty watchlist
      mockData,
      [],
      "2026-05-07",
      [],
      [],
      "alpha-asc",
      true, // showAllScreenings
    );
    expect(result.matches).toHaveLength(3);
    expect(result.matches[0].title).toBe("Movie A");
  });

  it("should still filter excluded movies when showAllScreenings is true", () => {
    const result = findMatchesWithFilters(
      [], // empty watchlist
      mockData,
      [],
      "2026-05-07",
      ["m2"], // exclude Movie A (m2)
      [],
      "alpha-asc",
      true, // showAllScreenings
    );
    expect(result.matches).toHaveLength(2);
    expect(result.matches.some((m) => m.id === "m2")).toBe(false);
  });
});

describe("calculateMatchCountsPerDay", () => {
  const mockData: CinemaData = {
    movies: [
      { id: "m1", title: "Movie B", boxd_uri: "https://boxd.it/uri1" },
      { id: "m2", title: "Movie A", boxd_uri: "https://boxd.it/uri2" },
    ],
    cinemas: [{ id: "c1", name: "Cinema 1", address: "Address 1" }],
    showtimes: {
      "2026-05-07": [
        { movie_id: "m1", cinema_id: "c1", times: ["12:00"] },
        { movie_id: "m2", cinema_id: "c1", times: ["14:00"] },
      ],
      "2026-05-08": [],
    },
    metadata: {
      last_scrape: "",
      total_movies: 2,
      available_dates: ["2026-05-07", "2026-05-08"],
      failures: [],
    },
  };

  it("should return match counts for each day", () => {
    const counts = calculateMatchCountsPerDay(
      ["https://boxd.it/uri1"],
      mockData,
      [],
    );
    expect(counts["2026-05-07"]).toBe(1);
    expect(counts["2026-05-08"]).toBe(0);
  });

  it("should return total movie counts when showAllScreenings is true", () => {
    const counts = calculateMatchCountsPerDay(
      [], // empty watchlist
      mockData,
      [],
      [],
      [],
      true, // showAllScreenings
    );
    expect(counts["2026-05-07"]).toBe(2);
    expect(counts["2026-05-08"]).toBe(0);
  });

  it("should filter match counts by selectedCinemaId when provided", () => {
    const countsC1 = calculateMatchCountsPerDay(
      [],
      mockData,
      [],
      [],
      [],
      true, // showAllScreenings
      "c1", // selectedCinemaId
    );
    expect(countsC1["2026-05-07"]).toBe(2);

    const countsC2 = calculateMatchCountsPerDay(
      [],
      mockData,
      [],
      [],
      [],
      true, // showAllScreenings
      "c2", // selectedCinemaId
    );
    expect(countsC2["2026-05-07"]).toBe(0);
  });
});

describe("Filtering Logic", () => {
  const cinemas = [
    { id: "c1", name: "Kino Muranów" }, // Independent
    { id: "c2", name: "Multikino Złote Tarasy" },
    { id: "c3", name: "Helios Blue City" },
    { id: "c4", name: "Cinema City Arkadia" },
    { id: "c5", name: "IMAX Sadyba" },
  ];

  it("should correctly identify visible cinemas based on active chains", () => {
    const visibleChains = ["Helios"];
    expect(isVisible("Kino Muranów", visibleChains)).toBe(true);
    expect(isVisible("Multikino Złote Tarasy", visibleChains)).toBe(false);
    expect(isVisible("Helios Blue City", visibleChains)).toBe(true);
    expect(isVisible("Cinema City Arkadia", visibleChains)).toBe(false);
    expect(isVisible("IMAX Sadyba", visibleChains)).toBe(false);
  });

  it("should correctly identify visible cinemas when multiple chains are active", () => {
    const visibleChains = ["Helios", "Multikino"];
    expect(isVisible("Kino Muranów", visibleChains)).toBe(true);
    expect(isVisible("Multikino Złote Tarasy", visibleChains)).toBe(true);
    expect(isVisible("Helios Blue City", visibleChains)).toBe(true);
    expect(isVisible("Cinema City Arkadia", visibleChains)).toBe(false);
  });
});

describe("isScreeningPast", () => {
  it("should identify a screening as past if its hour is strictly less than the current hour", () => {
    const now = new Date();
    now.setHours(16);
    now.setMinutes(0);

    expect(isScreeningPast("15:30", now)).toBe(true);
    expect(isScreeningPast("14:00", now)).toBe(true);
  });

  it("should identify a screening as past if its hour is equal to current hour and minute is less than or equal to current minute", () => {
    const now = new Date();
    now.setHours(16);
    now.setMinutes(30);

    expect(isScreeningPast("16:20", now)).toBe(true);
    expect(isScreeningPast("16:30", now)).toBe(true);
  });

  it("should not identify a screening as past if its hour is in the future", () => {
    const now = new Date();
    now.setHours(16);
    now.setMinutes(30);

    expect(isScreeningPast("17:00", now)).toBe(false);
    expect(isScreeningPast("16:40", now)).toBe(false);
  });

  it("should consider all screenings on a past date as past", () => {
    const now = new Date("2026-10-14T00:39:00");
    // Date is Tuesday Oct 13, now is Wednesday Oct 14
    expect(isScreeningPast("18:30", "2026-10-13", now)).toBe(true);
    expect(isScreeningPast("23:59", "2026-10-13", now)).toBe(true);
  });

  it("should not consider screenings on a future date as past", () => {
    const now = new Date("2026-10-14T00:39:00");
    // Date is Thursday Oct 15
    expect(isScreeningPast("09:00", "2026-10-15", now)).toBe(false);
    expect(isScreeningPast("18:30", "2026-10-15", now)).toBe(false);
  });

  it("should compare times when screening date matches today", () => {
    const now = new Date("2026-10-14T15:00:00");
    expect(isScreeningPast("14:30", "2026-10-14", now)).toBe(true);
    expect(isScreeningPast("15:30", "2026-10-14", now)).toBe(false);
  });
});

describe("hasFutureScreeningsForDate", () => {
  const showtimes = [{ times: ["12:00", "18:00"] }, { times: ["20:00"] }];

  it("returns false for past dates", () => {
    const now = new Date("2026-10-14T10:00:00");
    expect(hasFutureScreeningsForDate("2026-10-13", showtimes, now)).toBe(
      false,
    );
  });

  it("returns true for future dates with showtimes", () => {
    const now = new Date("2026-10-14T10:00:00");
    expect(hasFutureScreeningsForDate("2026-10-15", showtimes, now)).toBe(true);
  });

  it("returns true if today has remaining future showtimes", () => {
    const now = new Date("2026-10-14T15:00:00");
    expect(hasFutureScreeningsForDate("2026-10-14", showtimes, now)).toBe(true);
  });

  it("returns false if today has no remaining future showtimes", () => {
    const now = new Date("2026-10-14T21:00:00");
    expect(hasFutureScreeningsForDate("2026-10-14", showtimes, now)).toBe(
      false,
    );
  });
});

describe("isDateInPast", () => {
  const showtimes = [{ times: ["18:00", "20:00"] }];

  it("returns true for a past date", () => {
    const now = new Date("2026-10-14T00:39:00");
    expect(isDateInPast("2026-10-13", now)).toBe(true);
  });

  it("returns false for a future date", () => {
    const now = new Date("2026-10-14T00:39:00");
    expect(isDateInPast("2026-10-15", now)).toBe(false);
  });

  it("returns false for today if there are future showtimes", () => {
    const now = new Date("2026-10-14T12:00:00");
    expect(isDateInPast("2026-10-14", now, showtimes)).toBe(false);
  });

  it("returns true for today if all showtimes have ended", () => {
    const now = new Date("2026-10-14T21:00:00");
    expect(isDateInPast("2026-10-14", now, showtimes)).toBe(true);
  });
});

describe("getDefaultSelectedDate", () => {
  const dates = ["2026-10-13", "2026-10-14", "2026-10-15"];
  const showtimes = {
    "2026-10-13": [{ times: ["18:00", "20:30"] }],
    "2026-10-14": [{ times: ["14:00", "19:00"] }],
    "2026-10-15": [{ times: ["15:00", "20:00"] }],
  };

  it("defaults to today (Wednesday) when dates[0] is yesterday (Tuesday) - issue #62 edge case", () => {
    const now = new Date("2026-10-14T00:39:00");
    const result = getDefaultSelectedDate(dates, showtimes, now);
    expect(result).toBe("2026-10-14");
  });

  it("defaults to next day when today's screenings have all already started/ended", () => {
    const now = new Date("2026-10-13T23:45:00");
    const result = getDefaultSelectedDate(dates, showtimes, now);
    expect(result).toBe("2026-10-14");
  });

  it("defaults to today during daytime when screenings remain", () => {
    const now = new Date("2026-10-14T10:00:00");
    const result = getDefaultSelectedDate(dates, showtimes, now);
    expect(result).toBe("2026-10-14");
  });

  it("falls back to the latest date if all dates are in the past (stale data)", () => {
    const now = new Date("2026-10-20T12:00:00");
    const result = getDefaultSelectedDate(dates, showtimes, now);
    expect(result).toBe("2026-10-15");
  });

  it("returns empty string for empty dates list", () => {
    expect(getDefaultSelectedDate([])).toBe("");
  });
});

describe("groupMatchesByCity", () => {
  const cinemas: Cinema[] = [
    {
      id: "c1",
      name: "Kinoteka",
      address: "Warszawa, Poland",
      city: "Warszawa",
    },
    {
      id: "c2",
      name: "Muranów",
      address: "Warszawa, Poland",
      city: "Warszawa",
    },
    {
      id: "c3",
      name: "Kino Pod Baranami",
      address: "Kraków, Poland",
      city: "Kraków",
    },
  ];

  it("groups matches by city properly", () => {
    const matches = [
      {
        id: "m1",
        title: "Dune",
        boxd_uri: "https://boxd.it/dune",
        showtimes: [
          { cinema: "Kinoteka", cinema_id: "c1", times: ["18:00"] },
          { cinema: "Kino Pod Baranami", cinema_id: "c3", times: ["20:00"] },
        ],
      },
      {
        id: "m2",
        title: "Challengers",
        boxd_uri: "https://boxd.it/challengers",
        showtimes: [{ cinema: "Muranów", cinema_id: "c2", times: ["19:00"] }],
      },
    ];

    const grouped = groupMatchesByCity(matches, cinemas);
    expect(grouped.length).toBe(2);

    // Kraków should be first alphabetically
    expect(grouped[0].city).toBe("Kraków");
    expect(grouped[0].matches.length).toBe(1);
    expect(grouped[0].matches[0].title).toBe("Dune");
    expect(grouped[0].matches[0].showtimes.length).toBe(1);
    expect(grouped[0].matches[0].showtimes[0].cinema).toBe("Kino Pod Baranami");

    // Warszawa should be second
    expect(grouped[1].city).toBe("Warszawa");
    expect(grouped[1].matches.length).toBe(2);
    expect(grouped[1].matches[0].title).toBe("Dune");
    expect(grouped[1].matches[0].showtimes[0].cinema).toBe("Kinoteka");
    expect(grouped[1].matches[1].title).toBe("Challengers");
    expect(grouped[1].matches[1].showtimes[0].cinema).toBe("Muranów");
  });

  it("returns empty array for empty matches", () => {
    expect(groupMatchesByCity([], cinemas)).toEqual([]);
  });
});

describe("getAvailableCities", () => {
  it("extracts unique cities and sorts them alphabetically (Polish locale)", () => {
    const testCinemas: Cinema[] = [
      { id: "c1", name: "Kinoteka", address: "Warszawa", city: "Warszawa" },
      { id: "c2", name: "Muranów", address: "Warszawa", city: "Warszawa" },
      { id: "c3", name: "Barany", address: "Kraków", city: "Kraków" },
      { id: "c4", name: "Nowe Horyzonty", address: "Wrocław", city: "Wrocław" },
      { id: "c5", name: "Charlie", address: "Łódź", city: "Łódź" },
      { id: "c6", name: "No City Cinema", address: "Somewhere" },
    ];

    const cities = getAvailableCities(testCinemas);
    expect(cities).toEqual(["Kraków", "Łódź", "Warszawa", "Wrocław"]);
  });

  it("handles empty cinemas array gracefully", () => {
    expect(getAvailableCities([])).toEqual([]);
  });
});

describe("getNearestCity", () => {
  const cinemas: Cinema[] = [
    {
      id: "c1",
      name: "Kinoteka",
      address: "Warszawa",
      city: "Warszawa",
      coords: { lat: 52.23, lng: 21.01 },
    },
    {
      id: "c2",
      name: "Kino Pod Baranami",
      address: "Kraków",
      city: "Kraków",
      coords: { lat: 50.06, lng: 19.94 },
    },
    {
      id: "c3",
      name: "Nowe Horyzonty",
      address: "Wrocław",
      city: "Wrocław",
      coords: { lat: 51.11, lng: 17.03 },
    },
  ];

  it("identifies Kraków when coordinates are closest to Kraków", () => {
    // Near Kraków
    const loc = { lat: 50.05, lng: 19.95 };
    expect(getNearestCity(loc, cinemas)).toBe("Kraków");
  });

  it("identifies Warszawa when coordinates are closest to Warszawa", () => {
    // Near Warszawa
    const loc = { lat: 52.22, lng: 21.0 };
    expect(getNearestCity(loc, cinemas)).toBe("Warszawa");
  });

  it("returns null if cinemas array is empty", () => {
    expect(getNearestCity({ lat: 52.0, lng: 21.0 }, [])).toBeNull();
  });
});

describe("Movie Metadata Formatting & Preservation", () => {
  it("formats ratings correctly", () => {
    expect(formatRating(8.45)).toBe("8.5");
    expect(formatRating(7)).toBe("7.0");
    expect(formatRating(undefined)).toBeNull();
    expect(formatRating(0)).toBeNull();
  });

  it("formats vote counts correctly", () => {
    expect(formatVoteCount(450)).toBe("450");
    expect(formatVoteCount(1420)).toBe("1.4k");
    expect(formatVoteCount(15200)).toBe("15k");
    expect(formatVoteCount(1250000)).toBe("1.3M");
    expect(formatVoteCount(undefined)).toBeNull();
    expect(formatVoteCount(0)).toBeNull();
  });

  it("formats runtime correctly", () => {
    expect(formatRuntime(115)).toBe("115 min");
    expect(formatRuntime(90)).toBe("90 min");
    expect(formatRuntime(undefined)).toBeNull();
    expect(formatRuntime(0)).toBeNull();
  });

  it("generates TMDB URL correctly", () => {
    expect(
      getTmdbUrl(
        "https://www.themoviedb.org/movie/693134",
        123,
        "Dune: Part Two",
      ),
    ).toBe("https://www.themoviedb.org/movie/693134");
    expect(getTmdbUrl(undefined, 693134, "Dune: Part Two")).toBe(
      "https://www.themoviedb.org/movie/693134",
    );
    expect(getTmdbUrl(undefined, undefined, "Dune: Part Two")).toBe(
      "https://www.themoviedb.org/search/movie?query=Dune%3A%20Part%20Two",
    );
    expect(getTmdbUrl(undefined, undefined, "")).toBe(
      "https://www.themoviedb.org",
    );
  });

  it("preserves rating, vote_count, runtime, and tmdb_url in findMatchesWithFilters", () => {
    const dataWithMetadata: CinemaData = {
      movies: [
        {
          id: "m1",
          title: "Dune: Part Two",
          boxd_uri: "https://boxd.it/hZkK",
          rating: 8.5,
          vote_count: 1550,
          runtime: 166,
          tmdb_url: "https://www.themoviedb.org/movie/693134",
        },
      ],
      cinemas: [{ id: "c1", name: "Cinema 1", address: "Address 1" }],
      showtimes: {
        "2026-05-07": [{ movie_id: "m1", cinema_id: "c1", times: ["19:00"] }],
      },
      metadata: {
        last_scrape: "",
        total_movies: 1,
        available_dates: ["2026-05-07"],
        failures: [],
      },
    };

    const result = findMatchesWithFilters(
      ["https://boxd.it/hZkK"],
      dataWithMetadata,
      [],
      "2026-05-07",
    );

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].rating).toBe(8.5);
    expect(result.matches[0].vote_count).toBe(1550);
    expect(result.matches[0].runtime).toBe(166);
    expect(result.matches[0].tmdb_url).toBe(
      "https://www.themoviedb.org/movie/693134",
    );
  });
});

describe("getMovieScreeningDates", () => {
  const showtimes: Record<string, Showtime[]> = {
    "2026-10-14": [
      { movie_id: "m1", cinema_id: "c1", times: ["19:00"] },
      { movie_id: "m2", cinema_id: "c1", times: ["21:00"] },
    ],
    "2026-10-15": [{ movie_id: "m2", cinema_id: "c2", times: ["18:00"] }],
    "2026-10-16": [
      { movie_id: "m1", cinema_id: "c1", times: ["15:00"] },
      { movie_id: "m2", cinema_id: "c3", times: ["20:00"] },
    ],
  };

  it("returns sorted dates where the movie is screening", () => {
    expect(getMovieScreeningDates("m1", showtimes)).toEqual([
      "2026-10-14",
      "2026-10-16",
    ]);
    expect(getMovieScreeningDates("m2", showtimes)).toEqual([
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
    ]);
  });

  it("returns empty array when movie has no showtimes", () => {
    expect(getMovieScreeningDates("m999", showtimes)).toEqual([]);
  });
});

describe("formatChipDate", () => {
  it("formats date string to 'Weekday, Day Month'", () => {
    // 2026-10-14 is Wednesday
    expect(formatChipDate("2026-10-14")).toBe("Wed, 14 Oct");
    // 2026-10-15 is Thursday
    expect(formatChipDate("2026-10-15")).toBe("Thu, 15 Oct");
  });

  it("handles malformed string gracefully", () => {
    expect(formatChipDate("invalid-date")).toBe("invalid-date");
  });
});
