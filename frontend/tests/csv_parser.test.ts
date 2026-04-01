import { test, expect } from "vitest";
import { parseWatchlist } from "../utils/csv_parser";

test("extracts URIs from watchlist.csv", () => {
  const csv =
    "Date,Name,Year,Letterboxd URI\n2024-01-27,Dune,2021,https://boxd.it/fA7G";
  const uris = parseWatchlist(csv);
  expect(uris).toContain("https://boxd.it/fA7G");
});
