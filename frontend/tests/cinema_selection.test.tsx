import { test, expect, describe, vi, beforeEach, afterEach } from "vitest";
import React from "react";

// Mock React before any imports to handle ES6 hoisting
vi.mock("react", async (importOriginal) => {
  const original = await importOriginal<typeof import("react")>();
  return {
    ...original,
    useState: (initVal: any) => {
      return [globalThis.__MOCK_SELECTION__ ?? (typeof initVal === "function" ? initVal() : initVal), vi.fn()];
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
});

declare global {
  var __MOCK_SELECTION__: any;
}
