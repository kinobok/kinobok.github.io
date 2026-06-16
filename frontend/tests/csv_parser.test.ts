import { test, expect } from "vitest";
import { parseWatchlist } from "../utils/csv_parser";

test("extracts URIs from watchlist.csv", () => {
  const csv =
    "Date,Name,Year,Letterboxd URI\n2024-01-27,Dune,2021,https://boxd.it/fA7G";
  const uris = parseWatchlist(csv);
  expect(uris).toContain("https://boxd.it/fA7G");
});

test("throws error when CSV is empty", () => {
  expect(() => parseWatchlist("")).toThrow("The uploaded file is empty.");
  expect(() => parseWatchlist("   \n\n")).toThrow(
    "The uploaded file is empty.",
  );
});

test("throws error when Letterboxd URI column is missing", () => {
  const csv = "Date,Name,Year\n2024-01-27,Dune,2021";
  expect(() => parseWatchlist(csv)).toThrow(
    "Invalid file format. Could not find 'Letterboxd URI' column. Please make sure you are uploading a valid Letterboxd watchlist CSV.",
  );
});
