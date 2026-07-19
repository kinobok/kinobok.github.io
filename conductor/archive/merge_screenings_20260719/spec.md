# Specification: Merge Overlapping Screenings

## Overview
The application currently scrapes showtime data across multiple city regions. Some of these regions overlap, causing the scraper to fetch data for the same cinemas multiple times. This results in duplicate cinemas and duplicate showtimes in the exported `data.json` file. This track implements a deduplication mechanism in the Go scraper to merge overlapping cinemas and their respective screenings.

## Functional Requirements
- **Go Scraper Deduplication:** The deduplication logic must reside within the Go backend scraper before the final JSON export structure is formed.
- **Cinema Merging (Identity):** The scraper must uniquely identify cinemas by their exact "Cinema Name" (case-insensitive). If multiple scraped cinemas have the same name, they must be merged into a single cinema entity (sharing a single `CinemaID`).
- **Showtime Merging (Identity):** When aggregating showtimes for the same `MovieID` under the same `CinemaID`, the scraper must deduplicate the times using an exact string match. The final list of showtimes for a movie at a given cinema on a given date must contain only unique time entries.

## Non-Functional Requirements
- **Performance:** The deduplication logic should run efficiently in memory using maps/sets, without significantly increasing the scraper's execution time.
- **Data Integrity:** The deduplication process must ensure no valid showtimes or cinemas are lost, only exact duplicates removed.

## Acceptance Criteria
- [ ] The Go scraper groups scraped cinemas by their exact name.
- [ ] The exported `data_go.json` contains no duplicate cinemas (by name).
- [ ] For any given movie on a specific date at a specific cinema, the `times` array contains no duplicate time strings.
- [ ] Unit tests for the deduplication logic exist and pass.

## Out of Scope
- Deduplicating cinemas based on geographic coordinates or fuzzy address matching.
- Frontend modifications; the frontend should remain agnostic and simply consume the deduplicated JSON.
