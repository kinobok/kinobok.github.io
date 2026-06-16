import Papa from "papaparse";

export function parseWatchlist(csv: string): string[] {
  if (!csv || csv.trim() === "") {
    throw new Error("The uploaded file is empty.");
  }

  const parsed = Papa.parse(csv, { header: true });
  const headers = parsed.meta.fields;

  if (!headers || !headers.includes("Letterboxd URI")) {
    throw new Error(
      "Invalid file format. Could not find 'Letterboxd URI' column. Please make sure you are uploading a valid Letterboxd watchlist CSV.",
    );
  }

  return parsed.data
    .map((row: any) => row["Letterboxd URI"])
    .filter((uri: string) => uri !== undefined && uri !== "");
}
