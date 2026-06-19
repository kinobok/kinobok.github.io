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
    const result = MatchSidebar({
      matches: [],
      isExpanded: true,
      onToggleExpand: vi.fn(),
    });

    // Find the Search button - it should be a button element containing "🔍" or with a search-related identifier/class
    const searchButton = findElement(result, (el) => {
      if (el && el.type === "button") {
        const text = JSON.stringify(el.props);
        return (
          text.includes("🔍") ||
          text.includes("search") ||
          (el.props.className && el.props.className.includes("search"))
        );
      }
      return false;
    });

    expect(searchButton).toBeDefined();
    expect(searchButton).not.toBeNull();
  });

  test("clicking the Search button focuses the search input programmatically", () => {
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
      if (el && el.type === "button") {
        const text = JSON.stringify(el.props);
        return (
          text.includes("🔍") ||
          text.includes("search") ||
          (el.props.className && el.props.className.includes("search"))
        );
      }
      return false;
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
    const hideButton = findElement(result, (el) => el && el.type === "button" && el.props.title === "Hide sidebar");
    expect(hideButton).toBeDefined();
    expect(hideButton).not.toBeNull();

    // Expect a Search button
    const searchButton = findElement(result, (el) => el && el.type === "button" && el.props.title === "Search map");
    expect(searchButton).toBeDefined();
    expect(searchButton).not.toBeNull();
  });
});

// Declare global variable type for TypeScript safety
declare global {
  var __MOCK_IS_MOBILE__: boolean;
}
