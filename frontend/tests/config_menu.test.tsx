import { test, expect, describe, vi, beforeEach, afterEach } from "vitest";
import React from "react";

// Mock React before any imports to handle ES6 hoisting
vi.mock("react", async (importOriginal) => {
  const original = await importOriginal<typeof import("react")>();
  return {
    ...original,
    useState: (initVal: any) => {
      // By default, if the initial value is "Upload", use our global mock state
      if (initVal === "Upload") {
        return [globalThis.__MOCK_ACTIVE_TAB__ ?? "Upload", vi.fn()];
      }
      return [initVal, vi.fn()];
    },
    useMemo: (factory: any) => {
      return factory();
    },
    useEffect: (effect: any) => {
      effect();
      return undefined;
    },
  };
});

import ConfigMenu from "../components/ConfigMenu";

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

describe("ConfigMenu Tabs", () => {
  beforeEach(() => {
    globalThis.__MOCK_ACTIVE_TAB__ = "Upload";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders the four tab buttons when open", () => {
    const result = ConfigMenu({
      isOpen: true,
      onClose: vi.fn(),
      visibleChains: [],
      onToggleChain: vi.fn(),
      handleFileUpload: vi.fn(),
    });

    expect(result).not.toBeNull();

    // Find tab buttons in the tab bar
    const tabButtons = findAllElements(result, (el) => {
      return (
        el &&
        el.type === "button" &&
        el.props.className &&
        el.props.className.includes("tab-button")
      );
    });

    expect(tabButtons).toHaveLength(4);

    const tabLabels = tabButtons.map((btn) => btn.props.children);
    expect(tabLabels).toContain("Upload");
    expect(tabLabels).toContain("Cinemas");
    expect(tabLabels).toContain("Excluded Movies");
    expect(tabLabels).toContain("Other");
  });

  test("tab clicking logic works", () => {
    const result = ConfigMenu({
      isOpen: true,
      onClose: vi.fn(),
      visibleChains: [],
      onToggleChain: vi.fn(),
      handleFileUpload: vi.fn(),
    });

    const tabButtons = findAllElements(result, (el) => {
      return (
        el &&
        el.type === "button" &&
        el.props.className &&
        el.props.className.includes("tab-button")
      );
    });

    const uploadTabBtn = tabButtons.find(
      (btn) => btn.props.children === "Upload",
    );
    expect(uploadTabBtn).toBeDefined();

    // Triggers click callback
    const mockEvent = { stopPropagation: vi.fn() };
    uploadTabBtn!.props.onClick(mockEvent);
  });

  test("renders with Google Maps style left drawer wrapper", () => {
    const result = ConfigMenu({
      isOpen: true,
      onClose: vi.fn(),
      visibleChains: [],
      onToggleChain: vi.fn(),
      handleFileUpload: vi.fn(),
    });

    // Verify it renders the slide drawer class and transition style
    expect(result.props.className).toContain("config-menu-drawer-overlay");
    const drawerContent = findElement(
      result,
      (el) =>
        el &&
        el.props &&
        el.props.className &&
        el.props.className.includes("config-menu-drawer"),
    );
    expect(drawerContent).toBeDefined();
    expect(drawerContent).not.toBeNull();
  });

  test("renders full-width Scrape Dashboard button inside Other tab", () => {
    globalThis.__MOCK_ACTIVE_TAB__ = "Other";
    const onDashboardToggle = vi.fn();

    const result = ConfigMenu({
      isOpen: true,
      onClose: vi.fn(),
      visibleChains: [],
      onToggleChain: vi.fn(),
      handleFileUpload: vi.fn(),
      onDashboardToggle,
    });

    // Find the Scrape Dashboard button
    const dashboardBtn = findElement(result, (el) => {
      return (
        el && el.type === "button" && el.props.className === "dashboard-button"
      );
    });

    expect(dashboardBtn).toBeDefined();
    expect(dashboardBtn).not.toBeNull();
    expect(JSON.stringify(dashboardBtn.props.children)).toContain(
      "Scrape Dashboard",
    );

    // Click trigger callback
    dashboardBtn.props.onClick({ stopPropagation: vi.fn() });
    expect(onDashboardToggle).toHaveBeenCalled();
  });

  test("renders sort dropdown with popularity, rating, and year options", () => {
    globalThis.__MOCK_ACTIVE_TAB__ = "Other";
    const onSortChange = vi.fn();

    const result = ConfigMenu({
      isOpen: true,
      onClose: vi.fn(),
      visibleChains: [],
      onToggleChain: vi.fn(),
      handleFileUpload: vi.fn(),
      sortBy: "rare-week",
      onSortChange,
    });

    const selectEl = findElement(result, (el) => el && el.type === "select");
    expect(selectEl).toBeDefined();
    expect(selectEl).not.toBeNull();

    const optionValues = React.Children.toArray(selectEl.props.children).map(
      (opt: any) => opt.props.value,
    );
    expect(optionValues).toContain("rare-week");
    expect(optionValues).toContain("popularity-desc");
    expect(optionValues).toContain("rating-desc");
    expect(optionValues).toContain("year-desc");
    expect(optionValues).toContain("year-asc");

    // Change triggers callback
    selectEl.props.onChange({ target: { value: "popularity-desc" } });
    expect(onSortChange).toHaveBeenCalledWith("popularity-desc");
  });

  test("renders cinemas grouped by city and supports bulk city toggle", () => {
    globalThis.__MOCK_ACTIVE_TAB__ = "Cinemas";
    const onToggleCinemas = vi.fn();
    const onToggleCinema = vi.fn();

    const allCinemas = [
      { id: "c1", name: "Kinoteka", address: "Warszawa", city: "Warszawa" },
      { id: "c2", name: "Muranów", address: "Warszawa", city: "Warszawa" },
      {
        id: "c3",
        name: "Kino Pod Baranami",
        address: "Kraków",
        city: "Kraków",
      },
    ];

    const result = ConfigMenu({
      isOpen: true,
      onClose: vi.fn(),
      visibleChains: ["Multikino"],
      onToggleChain: vi.fn(),
      handleFileUpload: vi.fn(),
      allCinemas,
      excludedCinemaIds: ["c1"], // c1 is excluded in Warszawa
      onToggleCinema,
      onToggleCinemas,
    });

    expect(result).not.toBeNull();
    const contentStr = JSON.stringify(result);
    expect(contentStr).toContain("Cinemas by City");
    expect(contentStr).toContain("Warszawa");
    expect(contentStr).toContain("Kraków");

    // Find city checkboxes
    const checkboxes = findAllElements(
      result,
      (el) =>
        el && el.type === "input" && el.props && el.props.type === "checkbox",
    );

    // City headers + individual cinemas:
    // Kraków: 1 city checkbox + 1 cinema checkbox
    // Warszawa: 1 city checkbox + 2 cinema checkboxes
    // plus chain checkboxes at top
    expect(checkboxes.length).toBeGreaterThanOrEqual(5);

    // Find the Kraków city checkbox (checked = true because 0 excluded in Kraków)
    const krakowHeaderLabel = findElement(result, (el) => {
      return (
        el &&
        el.type === "label" &&
        el.props &&
        JSON.stringify(el.props.children).includes("Kraków") &&
        el.props.style &&
        el.props.style.color === "var(--lb-orange)"
      );
    });
    expect(krakowHeaderLabel).toBeDefined();

    const krakowCheckbox = findElement(
      krakowHeaderLabel,
      (el) => el && el.type === "input",
    );
    expect(krakowCheckbox).toBeDefined();
    expect(krakowCheckbox.props.checked).toBe(true);

    // Trigger toggle on Kraków header
    krakowCheckbox.props.onChange();
    expect(onToggleCinemas).toHaveBeenCalledWith(["c3"]);
  });

  test("renders 'Fold all' button when multiple cities are in ConfigMenu", () => {
    globalThis.__MOCK_ACTIVE_TAB__ = "Cinemas";
    const allCinemas = [
      { id: "c1", name: "Kinoteka", address: "Warszawa", city: "Warszawa" },
      {
        id: "c2",
        name: "Kino Pod Baranami",
        address: "Kraków",
        city: "Kraków",
      },
    ];

    const result = ConfigMenu({
      isOpen: true,
      onClose: vi.fn(),
      visibleChains: [],
      onToggleChain: vi.fn(),
      handleFileUpload: vi.fn(),
      allCinemas,
      onToggleCinema: vi.fn(),
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
  });

  test("renders starting city dropdown and locate me button in Cinemas tab", () => {
    globalThis.__MOCK_ACTIVE_TAB__ = "Cinemas";
    const onSelectDefaultCity = vi.fn();
    const onLocateMe = vi.fn();

    const result = ConfigMenu({
      isOpen: true,
      onClose: vi.fn(),
      visibleChains: [],
      onToggleChain: vi.fn(),
      handleFileUpload: vi.fn(),
      allCinemas: [],
      availableCities: ["Warszawa", "Kraków", "Wrocław"],
      defaultCity: "Warszawa",
      onSelectDefaultCity,
      onLocateMe,
    });

    const citySelect = findElement(
      result,
      (el) =>
        el &&
        el.type === "select" &&
        el.props.id === "config-default-city-select",
    );
    expect(citySelect).toBeDefined();
    expect(citySelect.props.value).toBe("Warszawa");

    citySelect.props.onChange({ target: { value: "Kraków" } });
    expect(onSelectDefaultCity).toHaveBeenCalledWith("Kraków");

    const locateBtn = findElement(
      result,
      (el) =>
        el &&
        el.type === "button" &&
        el.props.title === "Use my current location",
    );
    expect(locateBtn).toBeDefined();

    locateBtn.props.onClick();
    expect(onLocateMe).toHaveBeenCalledTimes(1);
  });
});

declare global {
  var __MOCK_ACTIVE_TAB__: string;
}
