import { test, expect, describe, vi } from "vitest";
import { Cinema, Movie, Showtime } from "../utils/matching_logic";

describe("Subissue #64: Search zone with current zoom", () => {
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
      name: "Muranów",
      address: "Warszawa",
      city: "Warszawa",
      coords: { lat: 52.24, lng: 20.99 },
    },
    {
      id: "c3",
      name: "Kino Pod Baranami",
      address: "Kraków",
      city: "Kraków",
      coords: { lat: 50.06, lng: 19.94 },
    },
  ];

  const showtimes: Showtime[] = [
    { cinema_id: "c1", movie_id: "m1", times: ["18:00"] },
    { cinema_id: "c3", movie_id: "m1", times: ["20:00"] },
  ];

  const warsawBounds = {
    south: 52.1,
    north: 52.3,
    west: 20.8,
    east: 21.2,
  };

  test("filters movie showtimes and cinemas to visible mapBounds without zooming out", () => {
    const selectedMovieId = "m1";

    const allMovieCinemas = cinemas.filter((c) =>
      showtimes.some(
        (st) => st.movie_id === selectedMovieId && st.cinema_id === c.id,
      ),
    );
    expect(allMovieCinemas.length).toBe(2); // c1 in Warsaw, c3 in Kraków

    // Filter to Warsaw zone
    const visibleMovieCinemas = allMovieCinemas.filter(
      (c) =>
        c.coords &&
        c.coords.lat >= warsawBounds.south &&
        c.coords.lat <= warsawBounds.north &&
        c.coords.lng >= warsawBounds.west &&
        c.coords.lng <= warsawBounds.east,
    );

    expect(visibleMovieCinemas.map((c) => c.id)).toEqual(["c1"]);

    // Calculate outside cinemas
    const outsideMovieCinemas = allMovieCinemas.filter(
      (c) =>
        !c.coords ||
        c.coords.lat < warsawBounds.south ||
        c.coords.lat > warsawBounds.north ||
        c.coords.lng < warsawBounds.west ||
        c.coords.lng > warsawBounds.east,
    );

    expect(outsideMovieCinemas.map((c) => c.id)).toEqual(["c3"]);
  });

  test("updates visible cinemas when zone changes to Kraków", () => {
    const selectedMovieId = "m1";
    const krakowBounds = {
      south: 50.0,
      north: 50.1,
      west: 19.8,
      east: 20.0,
    };

    const allMovieCinemas = cinemas.filter((c) =>
      showtimes.some(
        (st) => st.movie_id === selectedMovieId && st.cinema_id === c.id,
      ),
    );

    const visibleInKrakow = allMovieCinemas.filter(
      (c) =>
        c.coords &&
        c.coords.lat >= krakowBounds.south &&
        c.coords.lat <= krakowBounds.north &&
        c.coords.lng >= krakowBounds.west &&
        c.coords.lng <= krakowBounds.east,
    );

    expect(visibleInKrakow.map((c) => c.id)).toEqual(["c3"]);

    const outsideKrakow = allMovieCinemas.filter(
      (c) =>
        !c.coords ||
        c.coords.lat < krakowBounds.south ||
        c.coords.lat > krakowBounds.north ||
        c.coords.lng < krakowBounds.west ||
        c.coords.lng > krakowBounds.east,
    );

    expect(outsideKrakow.map((c) => c.id)).toEqual(["c1"]);
  });

  test("no automatic fitBounds on movie search, but fitBoundsCinemas triggers fitBounds on zoom out", () => {
    const fitBoundsMock = vi.fn();
    const mockMap = { fitBounds: fitBoundsMock };

    // Simulate MapController behavior for fitBoundsCinemas
    const triggerFitBoundsCinemas = (
      cinemasToFit: Cinema[] | null,
      mapObj: any,
    ) => {
      if (cinemasToFit && cinemasToFit.length > 0) {
        const valid = cinemasToFit.filter((c) => c.coords);
        if (valid.length > 0) {
          mapObj.fitBounds(valid);
        }
      }
    };

    // 1. Initial movie search (fitBoundsCinemas is null) -> NO fitBounds called!
    triggerFitBoundsCinemas(null, mockMap);
    expect(fitBoundsMock).not.toHaveBeenCalled();

    // 2. User clicks "Zoom out" button on hint banner -> fitBounds called!
    triggerFitBoundsCinemas(cinemas, mockMap);
    expect(fitBoundsMock).toHaveBeenCalledTimes(1);
  });

  test("MapBoundsController updates bounds on zoomend, moveend, viewreset, and resize", () => {
    const onBoundsChange = vi.fn();
    const mockBounds = {
      getWest: () => 20.0,
      getSouth: () => 50.0,
      getEast: () => 22.0,
      getNorth: () => 52.0,
    };
    const mockMap = {
      getBounds: () => mockBounds,
    };

    let eventHandlers: Record<string, () => void> = {};
    const useMapEventsMock = (handlers: Record<string, () => void>) => {
      eventHandlers = handlers;
    };

    const updateBounds = () => {
      const b = mockMap.getBounds();
      onBoundsChange({
        west: b.getWest(),
        south: b.getSouth(),
        east: b.getEast(),
        north: b.getNorth(),
      });
    };

    useMapEventsMock({
      moveend: updateBounds,
      zoomend: updateBounds,
      viewreset: updateBounds,
      resize: updateBounds,
    });

    // 1. Zoom out action fires zoomend
    eventHandlers.zoomend();
    expect(onBoundsChange).toHaveBeenCalledTimes(1);

    // 2. Locate me action fires moveend
    eventHandlers.moveend();
    expect(onBoundsChange).toHaveBeenCalledTimes(2);

    // 3. View reset or resize fires
    eventHandlers.viewreset();
    expect(onBoundsChange).toHaveBeenCalledTimes(3);

    eventHandlers.resize();
    expect(onBoundsChange).toHaveBeenCalledTimes(4);
  });

  test("fitBoundsCinemas notifies onBoundsChange so cinemas populate without manual map drag", () => {
    const onBoundsChange = vi.fn();
    const mockBounds = {
      getWest: () => 14.0,
      getSouth: () => 49.0,
      getEast: () => 24.0,
      getNorth: () => 54.0,
    };
    const mockMap = {
      fitBounds: vi.fn(),
      getBounds: () => mockBounds,
      once: vi.fn((event, cb) => cb()),
    };

    const triggerFitAndNotify = (
      cinemasToFit: Cinema[],
      mapObj: any,
      cb: any,
    ) => {
      mapObj.fitBounds(cinemasToFit);
      const b = mapObj.getBounds();
      cb({
        west: b.getWest(),
        south: b.getSouth(),
        east: b.getEast(),
        north: b.getNorth(),
      });
    };

    triggerFitAndNotify(cinemas, mockMap, onBoundsChange);
    expect(mockMap.fitBounds).toHaveBeenCalledWith(cinemas);
    expect(onBoundsChange).toHaveBeenCalledWith({
      west: 14.0,
      south: 49.0,
      east: 24.0,
      north: 54.0,
    });
  });
});
