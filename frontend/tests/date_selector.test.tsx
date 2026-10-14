import { test, expect, describe, vi } from "vitest";
import React from "react";
import DateSelector from "../components/DateSelector";

function findAllElements(
  element: any,
  predicate: (el: any) => boolean,
  results: any[] = [],
): any[] {
  if (!element) return results;
  if (predicate(element)) results.push(element);
  if (element.props && element.props.children) {
    const children = React.Children.toArray(element.props.children);
    for (const child of children) {
      findAllElements(child, predicate, results);
    }
  }
  return results;
}

describe("DateSelector", () => {
  const dates = ["2020-01-01", "2099-01-01"];
  const matchCounts = {
    "2020-01-01": 54,
    "2099-01-01": 65,
  };

  test("applies 'past' class and muted badge to past dates by default", () => {
    const onDateChange = vi.fn();
    const result = DateSelector({
      dates,
      selectedDate: "2099-01-01",
      onDateChange,
      matchCounts,
    });

    const buttons = findAllElements(
      result,
      (el) => el && el.type === "button" && el.props && el.props.className,
    );

    expect(buttons.length).toBe(2);

    // First button (2020-01-01) is in the past
    expect(buttons[0].props.className).toContain("past");
    expect(buttons[0].props.className).not.toContain("active");

    // Second button (2099-01-01) is in the future and selected
    expect(buttons[1].props.className).not.toContain("past");
    expect(buttons[1].props.className).toContain("active");
  });

  test("uses custom isDatePast callback when provided", () => {
    const onDateChange = vi.fn();
    const isDatePast = (d: string) => d === "2099-01-01";

    const result = DateSelector({
      dates,
      selectedDate: "2020-01-01",
      onDateChange,
      matchCounts,
      isDatePast,
    });

    const buttons = findAllElements(
      result,
      (el) => el && el.type === "button" && el.props && el.props.className,
    );

    expect(buttons[0].props.className).not.toContain("past");
    expect(buttons[0].props.className).toContain("active");

    expect(buttons[1].props.className).toContain("past");
  });

  test("renders muted badge styling for past date", () => {
    const onDateChange = vi.fn();
    const result = DateSelector({
      dates: ["2020-01-01"],
      selectedDate: "2020-01-01",
      onDateChange,
      matchCounts: { "2020-01-01": 12 },
    });

    const badges = findAllElements(
      result,
      (el) =>
        el &&
        el.type === "span" &&
        el.props &&
        el.props.style &&
        el.props.style.position === "absolute",
    );

    expect(badges.length).toBe(1);
    expect(badges[0].props.style.background).toBe("rgba(100, 100, 100, 0.6)");
    expect(badges[0].props.style.color).toBe("#bbb");
  });

  test("renders vibrant green badge styling for future date", () => {
    const onDateChange = vi.fn();
    const result = DateSelector({
      dates: ["2099-01-01"],
      selectedDate: "2099-01-01",
      onDateChange,
      matchCounts: { "2099-01-01": 25 },
    });

    const badges = findAllElements(
      result,
      (el) =>
        el &&
        el.type === "span" &&
        el.props &&
        el.props.style &&
        el.props.style.position === "absolute",
    );

    expect(badges.length).toBe(1);
    expect(badges[0].props.style.background).toBe("var(--lb-green)");
    expect(badges[0].props.style.color).toBe("#000");
  });

  test("clicking a date button triggers onDateChange", () => {
    const onDateChange = vi.fn();
    const result = DateSelector({
      dates,
      selectedDate: "2099-01-01",
      onDateChange,
    });

    const buttons = findAllElements(
      result,
      (el) => el && el.type === "button" && el.props && el.props.onClick,
    );

    buttons[0].props.onClick();
    expect(onDateChange).toHaveBeenCalledWith("2020-01-01");
  });
});
