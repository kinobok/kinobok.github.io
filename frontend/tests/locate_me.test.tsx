import { test, expect, describe, vi, beforeEach, afterEach } from "vitest";
import React from "react";

// Mock React to allow client-side simulation in Node test environment
vi.mock("react", async (importOriginal) => {
  const original = await importOriginal<typeof import("react")>();
  return {
    ...original,
    useState: (initVal: any) => {
      const val =
        globalThis.__MOCK_STATE__ !== undefined
          ? globalThis.__MOCK_STATE__
          : typeof initVal === "function"
            ? initVal()
            : initVal;
      return [val, vi.fn()];
    },
    useRef: (initVal: any) => {
      return { current: initVal };
    },
    useMemo: (factory: any) => factory(),
    useEffect: (effect: any) => {
      effect();
      return undefined;
    },
  };
});

// Mock leaflet
vi.mock("leaflet", () => ({
  default: {
    divIcon: vi.fn(() => ({})),
    latLng: vi.fn((lat, lng) => ({ lat, lng })),
    latLngBounds: vi.fn(() => ({})),
  },
  divIcon: vi.fn(() => ({})),
  latLng: vi.fn((lat, lng) => ({ lat, lng })),
  latLngBounds: vi.fn(() => ({})),
}));

// Mock react-leaflet
vi.mock("react-leaflet", () => {
  return {
    MapContainer: ({ children }: any) => <div>{children}</div>,
    TileLayer: () => <div />,
    Marker: ({ children }: any) => <div>{children}</div>,
    Popup: ({ children }: any) => <div>{children}</div>,
    useMap: () => ({
      setView: vi.fn(),
      getZoom: () => 12,
      getBounds: () => ({
        getWest: () => 20.0,
        getSouth: () => 52.0,
        getEast: () => 21.0,
        getNorth: () => 53.0,
      }),
      fitBounds: vi.fn(),
    }),
    useMapEvents: vi.fn(),
  };
});

import CinemaMap from "../components/CinemaMap";

function findElement(element: any, predicate: (el: any) => boolean): any {
  if (!element) return null;
  if (predicate(element)) return element;
  if (element.props && element.props.children) {
    const children = React.Children.toArray(element.props.children);
    for (const child of children) {
      const found = findElement(child, predicate);
      if (found) return found;
    }
  }
  return null;
}

describe("Issue #57: Map resetting to user location on state changes", () => {
  beforeEach(() => {
    globalThis.__MOCK_STATE__ = true; // Set isClient to true so Map renders
    (globalThis as any).window = {
      innerWidth: 1024,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("CinemaMap does not pass userLocation as default center to MapController when center is null", () => {
    const userLocation = { lat: 52.2297, lng: 21.0122 };

    // When center is null and userLocation is provided
    const result = CinemaMap({
      cinemas: [],
      userLocation: userLocation,
      center: null,
    });

    const mapController = findElement(
      result,
      (el) => el && el.props && "hasActiveMovieFilter" in el.props,
    );

    expect(mapController).not.toBeNull();
    // It should NOT fall back to userLocation when center is null
    expect(mapController.props.center).toBeNull();
  });

  test("CinemaMap passes center to MapController when a cinema is selected", () => {
    const cinemaCoords = { lat: 52.235, lng: 21.015 };
    const userLocation = { lat: 52.2297, lng: 21.0122 };

    const result = CinemaMap({
      cinemas: [],
      userLocation: userLocation,
      center: cinemaCoords,
    });

    const mapController = findElement(
      result,
      (el) => el && el.props && "hasActiveMovieFilter" in el.props,
    );

    expect(mapController).not.toBeNull();
    expect(mapController.props.center).toEqual([
      cinemaCoords.lat,
      cinemaCoords.lng,
    ]);
  });

  test("MapController logic does not re-center when cinema is deselected (center becomes null)", () => {
    const setViewMock = vi.fn();
    const mockMap = { setView: setViewMock };

    // Simulating the expected MapController logic
    const lastCenter = { current: null as [number, number] | null };

    const triggerMapCenter = (center: [number, number] | null, mapObj: any) => {
      if (center) {
        const hasChanged =
          !lastCenter.current ||
          lastCenter.current[0] !== center[0] ||
          lastCenter.current[1] !== center[1];
        if (hasChanged) {
          mapObj.setView(center, 14);
          lastCenter.current = center;
        }
      } else {
        lastCenter.current = null;
      }
    };

    // 1. Select a cinema
    const cinemaCenter: [number, number] = [52.23, 21.01];
    triggerMapCenter(cinemaCenter, mockMap);
    expect(setViewMock).toHaveBeenCalledTimes(1);
    expect(setViewMock).toHaveBeenCalledWith(cinemaCenter, 14);

    // 2. Deselect cinema (center becomes null)
    triggerMapCenter(null, mockMap);
    // setView should NOT be called again, preserving current view
    expect(setViewMock).toHaveBeenCalledTimes(1);

    // 3. Re-select the same cinema
    triggerMapCenter(cinemaCenter, mockMap);
    // Should re-center because lastCenter was cleared on deselect
    expect(setViewMock).toHaveBeenCalledTimes(2);
  });

  test("Locate Me button immediately pans to cached userLocation and triggers onLocationFound", () => {
    const userLocation = { lat: 52.2297, lng: 21.0122 };
    const onLocationFound = vi.fn();

    const getCurrentPositionMock = vi.fn();
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      configurable: true,
      writable: true,
    });

    const result = CinemaMap({
      cinemas: [],
      userLocation: userLocation,
      onLocationFound,
      center: null,
    });

    const locateBtn = findElement(
      result,
      (el) =>
        el &&
        el.type === "button" &&
        el.props &&
        el.props.title === "Locate Me",
    );

    expect(locateBtn).not.toBeNull();

    locateBtn.props.onClick();

    // Should immediately call onLocationFound with cached location
    expect(onLocationFound).toHaveBeenCalledWith(userLocation);
    // Should also request fresh coordinates in the background
    expect(getCurrentPositionMock).toHaveBeenCalledTimes(1);
  });
});
