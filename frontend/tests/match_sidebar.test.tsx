import { test, expect, describe, vi, beforeEach, afterEach } from "vitest";
import React from "react";

// Mock React before any imports to handle ES6 hoisting
vi.mock("react", async (importOriginal) => {
  const original = await importOriginal<typeof import("react")>();
  return {
    ...original,
    useState: (initVal: any) => {
      // By default, if it looks like isMobile state (boolean init to false), use our global mock value
      if (typeof initVal === "boolean" && initVal === false) {
        return [globalThis.__MOCK_IS_MOBILE__ ?? false, vi.fn()];
      }
      return [initVal, vi.fn()];
    },
    useEffect: (effect: any) => {
      effect();
      return undefined;
    },
    useRef: (initVal: any) => {
      return { current: initVal };
    },
    useMemo: (factory: any) => {
      return factory();
    },
  };
});

// Import components after the mock is defined
import MatchSidebar from "../components/MatchSidebar";
import DateSelector from "../components/DateSelector";

// Utility to recursively find a React element by its type or a condition
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

function findAllElements(
  element: any,
  predicate: (el: any) => boolean,
  results: any[] = [],
): any[] {
  if (!element) return results;
  if (predicate(element)) {
    results.push(element);
  }
  if (element.props && element.props.children) {
    const children = React.Children.toArray(element.props.children);
    for (const child of children) {
      findAllElements(child, predicate, results);
    }
  }
  return results;
}

describe("MatchSidebar", () => {
  beforeEach(() => {
    globalThis.__MOCK_IS_MOBILE__ = false;
    global.window = {
      innerWidth: 1024,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders DateSelector when dates are provided", () => {
    const onDateChange = vi.fn();
    const dates = ["2026-06-19", "2026-06-20"];
    const selectedDate = "2026-06-19";
    const matchCounts = { "2026-06-19": 2 };

    const result = MatchSidebar({
      matches: [],
      isExpanded: true,
      onToggleExpand: vi.fn(),
      dates,
      selectedDate,
      onDateChange,
      matchCounts,
    });

    expect(result).not.toBeNull();

    // Find DateSelector element in the rendered tree
    const dateSelectorNode = findElement(
      result,
      (el) => el && el.type === DateSelector,
    );
    expect(dateSelectorNode).toBeDefined();
    expect(dateSelectorNode).not.toBeNull();
    expect(dateSelectorNode.props.dates).toEqual(dates);
    expect(dateSelectorNode.props.selectedDate).toBe(selectedDate);
    expect(dateSelectorNode.props.matchCounts).toEqual(matchCounts);
  });

  test("renders a Search button (magnifying glass) in the sidepanel header structure", () => {
    globalThis.__MOCK_IS_MOBILE__ = true;
    const result = MatchSidebar({
      matches: [],
      isExpanded: true,
      onToggleExpand: vi.fn(),
    });

    // Find the Search button by its title prop
    const searchButton = findElement(result, (el) => {
      return el && el.type === "button" && el.props.title === "Search map";
    });

    expect(searchButton).toBeDefined();
    expect(searchButton).not.toBeNull();
  });

  test("clicking the Search button focuses the search input programmatically", () => {
    globalThis.__MOCK_IS_MOBILE__ = true;
    const focusMock = vi.fn();
    // Mock document.querySelector to return an object with focus mock
    const originalQuerySelector = global.document
      ? global.document.querySelector
      : undefined;
    global.document = {
      ...global.document,
      querySelector: vi.fn().mockImplementation((selector) => {
        if (selector === ".search-input-wrapper input") {
          return { focus: focusMock };
        }
        return null;
      }),
    } as any;

    const result = MatchSidebar({
      matches: [],
      isExpanded: true,
      onToggleExpand: vi.fn(),
    });

    const searchButton = findElement(result, (el) => {
      return el && el.type === "button" && el.props.title === "Search map";
    });

    expect(searchButton).toBeDefined();
    expect(searchButton).not.toBeNull();

    // Trigger click handler of the button
    const mockEvent = { stopPropagation: vi.fn() };
    searchButton.props.onClick(mockEvent);

    expect(focusMock).toHaveBeenCalled();

    // Restore original querySelector if it existed
    if (originalQuerySelector) {
      global.document.querySelector = originalQuerySelector;
    }
  });

  test("renders mobile-specific header with Hide and Search buttons when expanded on mobile", () => {
    globalThis.__MOCK_IS_MOBILE__ = true;

    const result = MatchSidebar({
      matches: [],
      isExpanded: true,
      onToggleExpand: vi.fn(),
    });

    // Expect a Hide button with chevron
    const hideButton = findElement(
      result,
      (el) => el && el.type === "button" && el.props.title === "Hide sidebar",
    );
    expect(hideButton).toBeDefined();
    expect(hideButton).not.toBeNull();

    // Expect a Search button
    const searchButton = findElement(
      result,
      (el) => el && el.type === "button" && el.props.title === "Search map",
    );
    expect(searchButton).toBeDefined();
    expect(searchButton).not.toBeNull();
  });

  test("swiping up on collapsed mobile root triggers expand", () => {
    globalThis.__MOCK_IS_MOBILE__ = true;
    const onToggleExpand = vi.fn();

    const result = MatchSidebar({
      matches: [],
      isExpanded: false,
      onToggleExpand,
    });

    expect(result.props.onTouchStart).toBeDefined();
    expect(result.props.onTouchMove).toBeDefined();
    expect(result.props.onTouchEnd).toBeDefined();

    // Simulate swipe up (Y decreases, e.g. from 200 to 100)
    result.props.onTouchStart({ touches: [{ clientY: 200 }] });
    result.props.onTouchMove({ touches: [{ clientY: 100 }] });
    result.props.onTouchEnd();

    expect(onToggleExpand).toHaveBeenCalledWith(true);
  });

  test("swiping down on expanded mobile top header triggers collapse", () => {
    globalThis.__MOCK_IS_MOBILE__ = true;
    const onToggleExpand = vi.fn();

    const result = MatchSidebar({
      matches: [],
      isExpanded: true,
      onToggleExpand,
    });

    // Find the expanded mobile header
    const expandedHeader = findElement(
      result,
      (el) => el && el.props && el.props.onTouchStart !== undefined,
    );
    expect(expandedHeader).toBeDefined();
    expect(expandedHeader).not.toBeNull();

    // Simulate swipe down (Y increases, e.g. from 100 to 200)
    expandedHeader.props.onTouchStart({ touches: [{ clientY: 100 }] });
    expandedHeader.props.onTouchMove({ touches: [{ clientY: 200 }] });
    expandedHeader.props.onTouchEnd();

    expect(onToggleExpand).toHaveBeenCalledWith(false);
  });

  test("renders Show All Screenings toggle button", () => {
    const onToggleShowAll = vi.fn();
    const result = MatchSidebar({
      matches: [],
      isExpanded: true,
      onToggleExpand: vi.fn(),
      showAllScreenings: true,
      onToggleShowAllScreenings: onToggleShowAll,
    });

    // Find the toggle wrapper
    const toggleWrapper = findElement(result, (el) => {
      return el && el.props && el.props.title === "Toggle show all screenings";
    });

    expect(toggleWrapper).toBeDefined();
    expect(toggleWrapper).not.toBeNull();

    // Find input element inside wrapper
    const input = findElement(toggleWrapper, (el) => el && el.type === "input");
    expect(input).toBeDefined();
    expect(input).not.toBeNull();

    // Trigger change
    input.props.onChange({ stopPropagation: vi.fn() });
    expect(onToggleShowAll).toHaveBeenCalled();
  });

  test("renders minimized state on mobile", () => {
    globalThis.__MOCK_IS_MOBILE__ = true;
    const onToggleMinimize = vi.fn();

    const result = MatchSidebar({
      matches: [],
      isExpanded: false,
      onToggleExpand: vi.fn(),
      isMinimized: true,
      onToggleMinimize,
    });

    // Verify it renders the 'Tap to see screenings' text
    const labelNode = findElement(result, (el) => {
      return (
        el &&
        typeof el === "object" &&
        JSON.stringify(el.props).includes("Tap to see screenings")
      );
    });

    expect(labelNode).toBeDefined();
    expect(labelNode).not.toBeNull();
  });

  test("renders selected cinema information when selectedCinema is provided", () => {
    const selectedCinema = {
      id: "c1",
      name: "Kinoteka",
      address: "Plac Defilad 1",
    };

    const result = MatchSidebar({
      matches: [],
      isExpanded: true,
      onToggleExpand: vi.fn(),
      selectedCinema,
    });

    // Find cinema name rendering inside the sidebar
    const cinemaInfoNode = findElement(result, (el) => {
      return (
        el &&
        typeof el === "object" &&
        JSON.stringify(el.props).includes("Kinoteka")
      );
    });

    expect(cinemaInfoNode).toBeDefined();
    expect(cinemaInfoNode).not.toBeNull();
  });

  test("greys out screening times with line-through on a past date", () => {
    const match = {
      id: "m1",
      title: "Dead Poets Society",
      boxd_uri: "https://boxd.it/123",
      poster: null,
      showtimes: [
        {
          cinema: "Kinoteka",
          cinema_id: "c1",
          times: ["18:30"],
        },
      ],
    };

    const result = MatchSidebar({
      matches: [match],
      isExpanded: true,
      onToggleExpand: vi.fn(),
      selectedDate: "2020-01-01", // definitely past date
    });

    const timeSpan = findElement(result, (el) => {
      return (
        el && el.type === "span" && el.props && el.props.children === "18:30"
      );
    });

    expect(timeSpan).toBeDefined();
    expect(timeSpan).not.toBeNull();
    expect(timeSpan.props.style.textDecoration).toBe("line-through");
    expect(timeSpan.props.style.color).toBe("rgba(255, 255, 255, 0.3)");
  });

  test("does not grey out screening times on a future date", () => {
    const match = {
      id: "m1",
      title: "Dead Poets Society",
      boxd_uri: "https://boxd.it/123",
      poster: null,
      showtimes: [
        {
          cinema: "Kinoteka",
          cinema_id: "c1",
          times: ["18:30"],
        },
      ],
    };

    const result = MatchSidebar({
      matches: [match],
      isExpanded: true,
      onToggleExpand: vi.fn(),
      selectedDate: "2099-01-01", // definitely future date
    });

    const timeSpan = findElement(result, (el) => {
      return (
        el && el.type === "span" && el.props && el.props.children === "18:30"
      );
    });

    expect(timeSpan).toBeDefined();
    expect(timeSpan).not.toBeNull();
    expect(timeSpan.props.style.textDecoration).toBe("none");
    expect(timeSpan.props.style.color).toBe("var(--lb-text-secondary)");
  });

  test("renders city section headers when matches span multiple cities", () => {
    const allCinemas = [
      { id: "c1", name: "Kinoteka", address: "Warszawa", city: "Warszawa" },
      {
        id: "c2",
        name: "Kino Pod Baranami",
        address: "Kraków",
        city: "Kraków",
      },
    ];

    const matches = [
      {
        id: "m1",
        title: "Dune",
        boxd_uri: "https://boxd.it/dune",
        showtimes: [{ cinema: "Kinoteka", cinema_id: "c1", times: ["18:00"] }],
      },
      {
        id: "m2",
        title: "Challengers",
        boxd_uri: "https://boxd.it/challengers",
        showtimes: [
          { cinema: "Kino Pod Baranami", cinema_id: "c2", times: ["20:00"] },
        ],
      },
    ];

    const result = MatchSidebar({
      matches,
      allCinemas,
      isExpanded: true,
      onToggleExpand: vi.fn(),
    });

    const headers = findAllElements(result, (el) => {
      return (
        el &&
        el.type === "div" &&
        el.props &&
        el.props.className === "city-section-header"
      );
    });

    expect(headers.length).toBe(2);
    expect(JSON.stringify(headers[0].props.children)).toContain("Kraków");
    expect(JSON.stringify(headers[1].props.children)).toContain("Warszawa");
  });

  test("does not render city section headers when matches are from only one city", () => {
    const allCinemas = [
      { id: "c1", name: "Kinoteka", address: "Warszawa", city: "Warszawa" },
      { id: "c2", name: "Muranów", address: "Warszawa", city: "Warszawa" },
    ];

    const matches = [
      {
        id: "m1",
        title: "Dune",
        boxd_uri: "https://boxd.it/dune",
        showtimes: [{ cinema: "Kinoteka", cinema_id: "c1", times: ["18:00"] }],
      },
    ];

    const result = MatchSidebar({
      matches,
      allCinemas,
      isExpanded: true,
      onToggleExpand: vi.fn(),
    });

    const headers = findAllElements(result, (el) => {
      return (
        el &&
        el.type === "div" &&
        el.props &&
        el.props.className === "city-section-header"
      );
    });

    expect(headers.length).toBe(0);
  });

  test("renders 'Fold all' button when multiple cities are shown and allows folding", () => {
    const allCinemas = [
      { id: "c1", name: "Kinoteka", address: "Warszawa", city: "Warszawa" },
      {
        id: "c2",
        name: "Kino Pod Baranami",
        address: "Kraków",
        city: "Kraków",
      },
    ];

    const matches = [
      {
        id: "m1",
        title: "Dune",
        boxd_uri: "https://boxd.it/dune",
        showtimes: [{ cinema: "Kinoteka", cinema_id: "c1", times: ["18:00"] }],
      },
      {
        id: "m2",
        title: "Challengers",
        boxd_uri: "https://boxd.it/challengers",
        showtimes: [
          { cinema: "Kino Pod Baranami", cinema_id: "c2", times: ["20:00"] },
        ],
      },
    ];

    const result = MatchSidebar({
      matches,
      allCinemas,
      isExpanded: true,
      onToggleExpand: vi.fn(),
    });

    const foldAllBtn = findElement(
      result,
      (el) =>
        el &&
        el.type === "button" &&
        el.props &&
        el.props.className === "fold-all-button",
    );

    expect(foldAllBtn).toBeDefined();
    expect(foldAllBtn).not.toBeNull();
    expect(foldAllBtn.props.children).toBe("Fold all");
  });

  test("renders search info in header between buttons when expanded on mobile", () => {
    globalThis.__MOCK_IS_MOBILE__ = true;

    const result = MatchSidebar({
      matches: [],
      isExpanded: true,
      onToggleExpand: vi.fn(),
      searchQuery: "Dune: Part Two",
    });

    const searchInfo = findElement(
      result,
      (el) =>
        el && el.props && el.props.className === "mobile-search-query-info",
    );

    expect(searchInfo).not.toBeNull();
    expect(searchInfo.props.children).toBe("Dune: Part Two");
  });

  test("does not render search info element when searchQuery is empty", () => {
    globalThis.__MOCK_IS_MOBILE__ = true;

    const result = MatchSidebar({
      matches: [],
      isExpanded: true,
      onToggleExpand: vi.fn(),
      searchQuery: "",
    });

    const searchInfo = findElement(
      result,
      (el) =>
        el && el.props && el.props.className === "mobile-search-query-info",
    );

    expect(searchInfo).toBeNull();
  });
});

// Declare global variable type for TypeScript safety
declare global {
  var __MOCK_IS_MOBILE__: boolean;
}
