import Papa from "papaparse";

export function parseWatchlist(csv: string): string[] {
  const parsed = Papa.parse(csv, { header: true });
  return parsed.data
    .map((row: any) => row["Letterboxd URI"])
    .filter((uri: string) => uri !== undefined && uri !== "");
}
