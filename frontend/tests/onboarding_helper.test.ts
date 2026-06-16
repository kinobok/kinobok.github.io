import { test, expect, describe } from "vitest";
import { shouldShowOnboarding } from "../utils/onboarding_helper";

describe("shouldShowOnboarding", () => {
  test("shows onboarding when watchlist is empty/null and not dismissed", () => {
    expect(shouldShowOnboarding(null, false)).toBe(true);
    expect(shouldShowOnboarding([], false)).toBe(true);
  });

  test("does not show onboarding when watchlist has items", () => {
    expect(shouldShowOnboarding(["https://boxd.it/fA7G"], false)).toBe(false);
  });

  test("does not show onboarding when user has dismissed or chose to browse without watchlist", () => {
    expect(shouldShowOnboarding(null, true)).toBe(false);
    expect(shouldShowOnboarding([], true)).toBe(false);
  });
});
