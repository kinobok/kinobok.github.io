import { describe, it, expect } from "vitest";
import { parseWatchlist } from "../utils/csv_parser";
import {
  isVisible,
  findMatchesWithFilters,
  calculateMatchCountsPerDay,
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
});

describe("calculateMatchCountsPerDay", () => {
  const mockData: CinemaData = {
    movies: [{ id: "m1", title: "Movie B", boxd_uri: "https://boxd.it/uri1" }],
    cinemas: [{ id: "c1", name: "Cinema 1", address: "Address 1" }],
    showtimes: {
      "2026-05-07": [{ movie_id: "m1", cinema_id: "c1", times: ["12:00"] }],
      "2026-05-08": [],
    },
    metadata: {
      last_scrape: "",
      total_movies: 1,
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
