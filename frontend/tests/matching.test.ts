import { describe, it, expect } from "vitest";
import { parseWatchlist } from "../utils/csv_parser";
import { isVisible, findMatchesWithFilters } from "../utils/matching_logic";

interface Movie {
  id: string;
  title: string;
  boxd_uri: string;
}

interface Showtime {
  movie_id: string;
  cinema_id: string;
  times: string[];
}

interface Data {
  movies: Movie[];
  cinemas: any[];
  showtimes: { [date: string]: Showtime[] };
}

describe("findMatchesWithFilters", () => {
  const mockData: Data = {
    movies: [{ id: "m1", title: "Movie 1", boxd_uri: "https://boxd.it/uri1" }],
    cinemas: [{ id: "c1", name: "Cinema 1" }],
    showtimes: {
      "2026-05-07": [{ movie_id: "m1", cinema_id: "c1", times: ["12:00"] }],
    },
  };

  it("should find matches for a specific date", () => {
    const result = findMatchesWithFilters(
      ["https://boxd.it/uri1"],
      mockData,
      [],
      "2026-05-07",
    );
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].title).toBe("Movie 1");
  });

  it("should return empty if date is missing in showtimes", () => {
    const result = findMatchesWithFilters(
      ["https://boxd.it/uri1"],
      mockData,
      [],
      "2026-05-08",
    );
    expect(result.matches).toHaveLength(0);
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
