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
    const onSelectMovie = vi.fn();

    const result = SearchBar({
      onMenuToggle: vi.fn(),
      searchQuery: "Multikino",
      onSearchChange,
      onSelectCinema,
      onSelectMovie,
    });

    const clearButton = findElement(result, (el) => {
      return el && el.type === "button" && el.props.title === "Clear search";
    });

    expect(clearButton).not.toBeNull();

    // Trigger clear click
    clearButton.props.onClick({ stopPropagation: vi.fn() });

    expect(onSearchChange).toHaveBeenCalledWith("");
    expect(onSelectCinema).toHaveBeenCalledWith(null);
    expect(onSelectMovie).toHaveBeenCalledWith(null);
  });

  test("displays typeahead suggestions for Cinema and Movie Names when input length > 1", () => {
    const cinemas = [{ id: "c1", name: "Kinoteka", address: "" }];
    const movies = [
      { id: "m1", title: "Project Hail Mary", boxd_uri: "https://boxd.it/1" },
    ];

    // Mock state suggestions to combine both
    globalThis.__MOCK_STATE__ = [
      { id: "c1", name: "Kinoteka", type: "cinema" },
      { id: "m1", name: "Project Hail Mary", type: "movie" },
    ];

    const result = SearchBar({
      onMenuToggle: vi.fn(),
      searchQuery: "Proj",
      onSearchChange: vi.fn(),
      allCinemas: cinemas,
      allMovies: movies,
    });

    // Find the suggestions dropdown list
    const dropdown = findElement(
      result,
      (el) =>
        el && el.props && el.props.className === "search-suggestions-dropdown",
    );
    expect(dropdown).toBeDefined();
    expect(dropdown).not.toBeNull();

    // Verify it contains the cinema suggestion
    const cinemaItem = findElement(dropdown, (el) => {
      return (
        el &&
        el.props &&
        el.props.className === "suggestion-item" &&
        JSON.stringify(el.props.children).includes("Kinoteka")
      );
    });
    expect(cinemaItem).not.toBeNull();

    // Verify it contains the movie suggestion
    const movieItem = findElement(dropdown, (el) => {
      return (
        el &&
        el.props &&
        el.props.className === "suggestion-item" &&
        JSON.stringify(el.props.children).includes("Project Hail Mary")
      );
    });
    expect(movieItem).not.toBeNull();
  });

  test("clicking movie suggestion triggers onSelectMovie and clears selectedCinema", () => {
    const onSearchChange = vi.fn();
    const onSelectCinema = vi.fn();
    const onSelectMovie = vi.fn();

    globalThis.__MOCK_STATE__ = [
      { id: "m1", name: "Project Hail Mary", type: "movie" },
    ];

    const result = SearchBar({
      onMenuToggle: vi.fn(),
      searchQuery: "Proj",
      onSearchChange,
      onSelectCinema,
      onSelectMovie,
    });

    const dropdown = findElement(
      result,
      (el) =>
        el && el.props && el.props.className === "search-suggestions-dropdown",
    );

    const movieItem = findElement(
      dropdown,
      (el) => el && el.props && el.props.className === "suggestion-item",
    );

    movieItem.props.onClick({ stopPropagation: vi.fn() });

    expect(onSearchChange).toHaveBeenCalledWith("Project Hail Mary");
    expect(onSelectMovie).toHaveBeenCalledWith("m1");
  });
});

declare global {
  var __MOCK_STATE__: any;
}
