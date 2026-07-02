# Implementation Plan: Golang Scraper

## Phase 1: Filmweb Scraper (Concurrent)
- [x] Task: Filmweb Models and Colly Setup
    - [x] Write Tests (Red Phase): Define mock server responses and test basic Colly initialization.
    - [x] Implement (Green Phase): Configure Colly collector and set up Goroutine/Channel architecture.
- [x] Task: Filmweb Parsing Logic
    - [x] Write Tests (Red Phase): Test parsing logic for extracting titles, cinemas, and showtimes from mock HTML.
    - [x] Implement (Green Phase): Implement Colly callbacks, parse HTML, and feed results through channels.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Filmweb Scraper (Concurrent)' (Protocol in workflow.md)

## Phase 2: Letterboxd and TMDB Integrations
- [x] Task: TMDB API Integration
    - [x] Write Tests (Red Phase): Test concurrent fetching of metadata and posters using a mock HTTP client.
    - [x] Implement (Green Phase): Write concurrent HTTP requests to TMDB and merge with movie data.
- [x] Task: Letterboxd Integration
    - [x] Write Tests (Red Phase): Test extraction/parsing of Letterboxd watchlists.
    - [x] Implement (Green Phase): Build Letterboxd scraping/parsing logic.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Letterboxd and TMDB Integrations' (Protocol in workflow.md)

## Phase 3: Data Aggregation & Export
- [x] Task: Orchestration in Main
    - [x] Write Tests (Red Phase): Test the synchronization and merging of data from Filmweb, TMDB, and Letterboxd.
    - [x] Implement (Green Phase): Coordinate channels and Goroutines in the main entrypoint (`cmd/scraper/main.go`).
- [x] Task: Strict Parity JSON Export
    - [x] Write Tests (Red Phase): Assert that the generated `data_go.json` strictly adheres to the existing Next.js frontend schema.
    - [x] Implement (Green Phase): Write the final JSON export logic in `internal/export`.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Data Aggregation & Export' (Protocol in workflow.md)

## Phase 4: CI/CD Integration
- [x] Task: GitHub Actions Updates
    - [x] Write Tests (Red Phase): (Skip logic tests, test via dry-run or local action simulator if possible).
    - [x] Implement (Green Phase): Configure `daily-scraper-go.yml` to execute the Go scraper concurrently with Python and upload `data_go.json` as an artifact or commit it.
- [x] Task: Conductor - User Manual Verification 'Phase 4: CI/CD Integration' (Protocol in workflow.md)