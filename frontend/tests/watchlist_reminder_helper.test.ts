import { test, expect, describe } from "vitest";
import { shouldShowReminder } from "../utils/watchlist_reminder_helper";

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = 7 * ONE_DAY;

describe("shouldShowReminder", () => {
  test("returns false when lastUploadTimestamp is null (no watchlist uploaded yet)", () => {
    const now = Date.now();
    expect(shouldShowReminder(null, null, now)).toBe(false);
  });

  test("returns false when watchlist is less than a week old", () => {
    const now = Date.now();
    const lastUpload = now - (ONE_WEEK - 1000); // just under a week old
    expect(shouldShowReminder(lastUpload, null, now)).toBe(false);
  });

  test("returns true when watchlist is exactly or more than a week old, and never snoozed", () => {
    const now = Date.now();
    const lastUploadExact = now - ONE_WEEK;
    const lastUploadOlder = now - (ONE_WEEK + ONE_DAY);
    expect(shouldShowReminder(lastUploadExact, null, now)).toBe(true);
    expect(shouldShowReminder(lastUploadOlder, null, now)).toBe(true);
  });

  test("returns false when watchlist is old but snoozed less than 24 hours ago", () => {
    const now = Date.now();
    const lastUpload = now - (ONE_WEEK + ONE_DAY);
    const snooze = now - (ONE_DAY - 1000); // 23h 59m ago
    expect(shouldShowReminder(lastUpload, snooze, now)).toBe(false);
  });

  test("returns true when watchlist is old and snoozed exactly or more than 24 hours ago", () => {
    const now = Date.now();
    const lastUpload = now - (ONE_WEEK + ONE_DAY);
    const snoozeExact = now - ONE_DAY;
    const snoozeOlder = now - (ONE_DAY + ONE_DAY);
    expect(shouldShowReminder(lastUpload, snoozeExact, now)).toBe(true);
    expect(shouldShowReminder(lastUpload, snoozeOlder, now)).toBe(true);
  });
});
