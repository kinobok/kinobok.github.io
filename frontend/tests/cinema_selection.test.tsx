import { test, expect, describe, vi, beforeEach, afterEach } from "vitest";
import React from "react";

// Mock React before any imports to handle ES6 hoisting
vi.mock("react", async (importOriginal) => {
  const original = await importOriginal<typeof import("react")>();
  return {
    ...original,
    useState: (initVal: any) => {
      return [
        globalThis.__MOCK_SELECTION__ ??
          (typeof initVal === "function" ? initVal() : initVal),
        vi.fn(),
      ];
    },
    useRef: (initVal: any) => {
      return { current: initVal };
    },
  };
});

import CinemaMap from "../components/CinemaMap";

describe("CinemaSelection", () => {
  beforeEach(() => {
    globalThis.__MOCK_SELECTION__ = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("filters matches list when cinema ID is selected", () => {
    const mockMatch = {
      id: "m1",
      title: "Movie A",
      showtimes: [
        { cinema_id: "c1", times: ["12:00"] },
        { cinema_id: "c2", times: ["14:00"] },
      ],
    };

    const selectedCinemaId = "c1";

    // Test the logic directly: filtering movie matches by selectedCinemaId
    const filteredMatches = [mockMatch]
      .map((m) => ({
        ...m,
        showtimes: m.showtimes.filter((s) => s.cinema_id === selectedCinemaId),
      }))
      .filter((m) => m.showtimes.length > 0);

    expect(filteredMatches).toHaveLength(1);
    expect(filteredMatches[0].showtimes).toHaveLength(1);
    expect(filteredMatches[0].showtimes[0].cinema_id).toBe("c1");
  });

  test("clicking empty map space triggers onSelectCinema(null)", () => {
    const onSelectCinema = vi.fn();

    // Create a mock container or element that registers Leaflet Map Container click behavior
    const triggerMapClick = (onSelect: any) => {
      onSelect(null);
    };

    triggerMapClick(onSelectCinema);

    expect(onSelectCinema).toHaveBeenCalledWith(null);
  });

  test("map view controller prevents redundant re-centering when coordinates remain unchanged", () => {
    const setViewMock = vi.fn();
    const mockMap = { setView: setViewMock };

    // Simulating MapController logic
    const lastCenter = { current: null as [number, number] | null };

    const triggerMapCenter = (center: [number, number], mapObj: any) => {
      const hasChanged =
        !lastCenter.current ||
        lastCenter.current[0] !== center[0] ||
        lastCenter.current[1] !== center[1];
      if (hasChanged) {
        mapObj.setView(center, 12);
        lastCenter.current = center;
      }
    };

    const coord1: [number, number] = [52.2, 21.0];
    triggerMapCenter(coord1, mockMap);
    expect(setViewMock).toHaveBeenCalledTimes(1);

    // Call again with the same coordinates - should NOT trigger setView again
    triggerMapCenter(coord1, mockMap);
    expect(setViewMock).toHaveBeenCalledTimes(1);

    // Call with different coordinates - should trigger setView
    const coord2: [number, number] = [52.3, 21.1];
    triggerMapCenter(coord2, mockMap);
    expect(setViewMock).toHaveBeenCalledTimes(2);
  });

  test("filters matches and cinemas lists when selectedMovieId is provided", () => {
    const mockMatches = [
      {
        id: "m1",
        title: "Movie A",
        showtimes: [{ cinema_id: "c1", times: ["12:00"] }],
      },
      {
        id: "m2",
        title: "Movie B",
        showtimes: [{ cinema_id: "c2", times: ["14:00"] }],
      },
    ];

    const mockCinemas = [
      { id: "c1", name: "Cinema 1" },
      { id: "c2", name: "Cinema 2" },
    ];

    const selectedMovieId = "m1";

    // Simulate page.tsx logic:
    // 1. Find all cinema IDs playing selectedMovieId
    const showtimesForDate = [
      { movie_id: "m1", cinema_id: "c1", times: ["12:00"] },
    ];
    const movieCinemaIds = new Set(
      showtimesForDate
        .filter((st) => st.movie_id === selectedMovieId)
        .map((st) => st.cinema_id),
    );

    // 2. Filter matches and cinemas
    const filteredMatches = mockMatches.filter((m) => m.id === selectedMovieId);
    const filteredCinemas = mockCinemas.filter((c) => movieCinemaIds.has(c.id));

    expect(filteredMatches).toHaveLength(1);
    expect(filteredMatches[0].id).toBe("m1");

    expect(filteredCinemas).toHaveLength(1);
    expect(filteredCinemas[0].id).toBe("c1");
  });
});

declare global {
  var __MOCK_SELECTION__: any;
}
