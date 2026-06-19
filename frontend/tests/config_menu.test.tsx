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
function findAllElements(element: any, predicate: (el: any) => boolean, results: any[] = []): any[] {
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
      return el && el.type === "button" && el.props.className && el.props.className.includes("tab-button");
    });

    expect(tabButtons).toHaveLength(4);
    
    const tabLabels = tabButtons.map(btn => btn.props.children);
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
      return el && el.type === "button" && el.props.className && el.props.className.includes("tab-button");
    });

    const uploadTabBtn = tabButtons.find(btn => btn.props.children === "Upload");
    expect(uploadTabBtn).toBeDefined();

    // Triggers click callback
    const mockEvent = { stopPropagation: vi.fn() };
    uploadTabBtn!.props.onClick(mockEvent);
  });
});

declare global {
  var __MOCK_ACTIVE_TAB__: string;
}
