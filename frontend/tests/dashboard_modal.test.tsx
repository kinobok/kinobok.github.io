import { test, expect, describe, vi } from "vitest";
import React from "react";
import DashboardModal from "../components/DashboardModal";
import { Metadata } from "../utils/matching_logic";

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

describe("DashboardModal", () => {
  const mockMetadata: Metadata = {
    last_scrape: "2026-10-14T12:00:00Z",
    total_movies: 150,
    available_dates: ["2026-10-14", "2026-10-15"],
    failures: [
      {
        title: "Unknown Film",
        reason: "Failed to resolve Letterboxd slug",
        details: "404 Not Found",
      },
    ],
  };

  test("renders GitHub issue report link and GitHub repository link", () => {
    const result = DashboardModal({
      isOpen: true,
      onClose: vi.fn(),
      metadata: mockMetadata,
    });

    expect(result).not.toBeNull();

    // 1. Report issue link next to failures
    const reportLink = findElement(
      result,
      (el) =>
        el &&
        el.type === "a" &&
        el.props.href === "https://github.com/kinobok/kinobok.github.io/issues",
    );
    expect(reportLink).not.toBeNull();
    expect(reportLink.props.children).toContain("Report Issue on GitHub");

    // 2. Repository link in footer
    const repoLink = findElement(
      result,
      (el) =>
        el &&
        el.type === "a" &&
        el.props.href === "https://github.com/kinobok/kinobok.github.io",
    );
    expect(repoLink).not.toBeNull();
    expect(repoLink.props.children).toContain("GitHub Repository");
  });
});
