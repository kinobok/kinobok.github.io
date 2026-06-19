import { test, expect, describe, vi, beforeEach, afterEach } from "vitest";
import React from "react";

// Mock React before any imports to handle ES6 hoisting
vi.mock("react", async (importOriginal) => {
  const original = await importOriginal<typeof import("react")>();
  return {
    ...original,
    useState: (initVal: any) => {
      // Allow us to mock internal state by checking initial values or using a global setter
      return [
        globalThis.__MOCK_STATE__ ??
          (typeof initVal === "function" ? initVal() : initVal),
        vi.fn(),
      ];
    },
    useEffect: (effect: any) => {
      effect();
      return undefined;
    },
  };
});

import SearchBar from "../components/SearchBar";
import { X } from "lucide-react";

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

// Utility to recursively find all React elements matching a predicate
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

describe("SearchBar", () => {
  beforeEach(() => {
    globalThis.__MOCK_STATE__ = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders basic structure", () => {
    const result = SearchBar({
      onMenuToggle: vi.fn(),
      searchQuery: "",
      onSearchChange: vi.fn(),
    });

    expect(result).not.toBeNull();
    expect(result.type).toBe("div");
    expect(result.props.className).toBe("search-bar-container");
  });

  test("renders X (Clear) button when query is populated", () => {
    const result = SearchBar({
      onMenuToggle: vi.fn(),
      searchQuery: "Multikino",
      onSearchChange: vi.fn(),
    });

    // Find the Clear button (using X icon)
    const clearButton = findElement(result, (el) => {
      return el && el.type === "button" && el.props.title === "Clear search";
    });

    expect(clearButton).toBeDefined();
    expect(clearButton).not.toBeNull();

    // Verify it renders the X icon
    const xIcon = findElement(clearButton, (el) => el && el.type === X);
    expect(xIcon).toBeDefined();
    expect(xIcon).not.toBeNull();
  });

  test("clicking X (Clear) button clears search and selected cinema", () => {
    const onSearchChange = vi.fn();
    const onSelectCinema = vi.fn();

    const result = SearchBar({
      onMenuToggle: vi.fn(),
      searchQuery: "Multikino",
      onSearchChange,
      onSelectCinema,
    });

    const clearButton = findElement(result, (el) => {
      return el && el.type === "button" && el.props.title === "Clear search";
    });

    expect(clearButton).not.toBeNull();

    // Trigger clear click
    clearButton.props.onClick({ stopPropagation: vi.fn() });

    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onSelectCinema).toHaveBeenCalledWith(null);
  });

  test("displays typeahead suggestions for Cinema Names when input length > 1", () => {
    const cinemas = [
      { id: "c1", name: "Kinoteka" },
      { id: "c2", name: "Multikino Ursynow" },
      { id: "c3", name: "Cinema City Sadyba" },
    ];

    // Mock state so suggestions is populated
    globalThis.__MOCK_STATE__ = [cinemas[1]]; // Mocking filtered suggestions array state

    const result = SearchBar({
      onMenuToggle: vi.fn(),
      searchQuery: "Multi",
      onSearchChange: vi.fn(),
      allCinemas: cinemas,
    });

    // Find the suggestions dropdown list
    const dropdown = findElement(
      result,
      (el) =>
        el && el.props && el.props.className === "search-suggestions-dropdown",
    );
    expect(dropdown).toBeDefined();
    expect(dropdown).not.toBeNull();

    // Find the suggestion item
    const item = findElement(
      dropdown,
      (el) => el && el.props && el.props.className === "suggestion-item",
    );
    expect(item).toBeDefined();
    expect(item).not.toBeNull();
    expect(JSON.stringify(item.props.children)).toContain("Multikino Ursynow");
  });

  test("hides typeahead suggestions when the search query exactly matches a cinema name", () => {
    const cinemas = [{ id: "c1", name: "Kinoteka" }];

    globalThis.__MOCK_STATE__ = undefined;

    const result = SearchBar({
      onMenuToggle: vi.fn(),
      searchQuery: "Kinoteka",
      onSearchChange: vi.fn(),
      allCinemas: cinemas,
    });

    const dropdown = findElement(
      result,
      (el) =>
        el && el.props && el.props.className === "search-suggestions-dropdown",
    );
    expect(dropdown).toBeNull();
  });
});

declare global {
  var __MOCK_STATE__: any;
}
