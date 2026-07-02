# Specification: Golang Scraper Implementation

## Overview
This track focuses on implementing the backend scraper for kinobok in Golang using the Colly framework, intended to eventually replace the existing Python scraper. The initial deployment will run in parallel with the Python scraper to ensure data parity before a full transition.

## Functional Requirements
1. **Filmweb Scraper:** Implement the logic to scrape movie showtimes and cinema details from Filmweb using the Colly framework.
2. **Letterboxd Scraper:** Implement the logic to process Letterboxd watchlists/data.
3. **TMDB Scraper:** Implement integration with the TMDB API/scraper to fetch posters and metadata for movies.
4. **Data Export:** Generate the final JSON file (`data_go.json`) containing all parsed and matched data.

## Non-Functional Requirements
1. **Strict Parity:** The exported JSON file (`data_go.json`) MUST perfectly match the schema of the current Python scraper's `data.json` to ensure Next.js frontend compatibility.
2. **Parallel Execution:** The new Golang scraper must be integrated into the existing CI/CD (GitHub Actions) to run alongside the Python scraper, outputting to a separate file (`data_go.json`) without breaking the current production build.
3. **Language/Framework:** Use Golang and the Colly web scraping framework as defined in the `scraper_go` directory.
4. **Concurrency:** Heavily utilize Goroutines and Channels within the scraping process to maximize throughput and enhance the overall execution speed.

## Acceptance Criteria
- [ ] `FilmwebScraper` correctly parses cinemas, times, and movie titles utilizing concurrent processing.
- [ ] `Letterboxd` integration correctly extracts watchlist data.
- [ ] `TMDB` integration accurately fetches required movie metadata concurrently.
- [ ] `export` package correctly generates `data_go.json` with strict schema parity.
- [ ] Concurrency patterns (Goroutines/Channels) are demonstrably used for performance.
- [ ] GitHub Actions workflow is updated to run the Golang scraper and output `data_go.json` alongside `data.json`.
- [ ] The Next.js frontend can flawlessly consume `data_go.json` if swapped (to be tested locally or manually).

## Out of Scope
- Modifying the frontend application code to permanently switch to `data_go.json`.
- Removing or disabling the Python scraper.