import { test, expect, describe, vi } from "vitest";
import React from "react";

// Mock React before any imports to handle ES6 hoisting in Node test environment
vi.mock("react", async (importOriginal) => {
  const original = await importOriginal<typeof import("react")>();
  return {
    ...original,
    useState: (initVal: any) => {
      return [initVal, vi.fn()];
    },
    useRef: (initVal: any) => ({ current: initVal }),
    useMemo: (factory: any) => factory(),
    useEffect: (effect: any) => {
      effect();
      return undefined;
    },
  };
});

import GuidanceModal from "../components/GuidanceModal";

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

describe("GuidanceModal", () => {
  test("renders starting city dropdown and locate me button", () => {
    const onSelectCity = vi.fn();
    const onLocateMe = vi.fn();
    const onBrowseWithoutWatchlist = vi.fn();

    const result = GuidanceModal({
      isOpen: true,
      onUpload: vi.fn(),
      onBrowseWithoutWatchlist,
      availableCities: ["Warszawa", "Kraków", "Gdańsk"],
      selectedCity: "Warszawa",
      onSelectCity,
      onLocateMe,
      isLocationActive: false,
    });

    expect(result).not.toBeNull();

    const citySelect = findElement(
      result,
      (el) =>
        el && el.type === "select" && el.props.id === "starting-city-select",
    );
    expect(citySelect).not.toBeNull();
    expect(citySelect.props.value).toBe("Warszawa");

    citySelect.props.onChange({ target: { value: "Kraków" } });
    expect(onSelectCity).toHaveBeenCalledWith("Kraków");

    const locateBtn = findElement(
      result,
      (el) => el && el.type === "button" && el.props.title === "Locate Me",
    );
    expect(locateBtn).not.toBeNull();

    locateBtn.props.onClick();
    expect(onLocateMe).toHaveBeenCalledTimes(1);

    const browseBtn = findElement(
      result,
      (el) =>
        el &&
        el.type === "button" &&
        el.props.children &&
        React.Children.toArray(el.props.children).some(
          (c: any) =>
            typeof c === "string" && c.includes("Browse without watchlist"),
        ),
    );
    expect(browseBtn).not.toBeNull();
    browseBtn.props.onClick();
    expect(onBrowseWithoutWatchlist).toHaveBeenCalledTimes(1);
  });

  test("displays '📍 Using your location' badge when isLocationActive is true", () => {
    const result = GuidanceModal({
      isOpen: true,
      onUpload: vi.fn(),
      onBrowseWithoutWatchlist: vi.fn(),
      availableCities: ["Warszawa"],
      selectedCity: "Warszawa",
      isLocationActive: true,
    });

    const badge = findElement(
      result,
      (el) =>
        el &&
        el.type === "span" &&
        typeof el.props.children === "string" &&
        el.props.children.includes("Using your location"),
    );
    expect(badge).not.toBeNull();
  });

  test("renders GitHub report link when error is present", () => {
    const result = GuidanceModal({
      isOpen: true,
      onUpload: vi.fn(),
      onBrowseWithoutWatchlist: vi.fn(),
      error: "Failed to parse CSV file",
    });

    const reportLink = findElement(
      result,
      (el) =>
        el &&
        el.type === "a" &&
        el.props.href === "https://github.com/kinobok/kinobok.github.io/issues",
    );
    expect(reportLink).not.toBeNull();
    expect(reportLink.props.children).toContain("Report an issue on GitHub");
  });
});
