# Implementation Plan: Golang Scraper

## Phase 1: Filmweb Scraper (Concurrent)
- [ ] Task: Filmweb Models and Colly Setup
    - [ ] Write Tests (Red Phase): Define mock server responses and test basic Colly initialization.
    - [ ] Implement (Green Phase): Configure Colly collector and set up Goroutine/Channel architecture.
- [ ] Task: Filmweb Parsing Logic
    - [ ] Write Tests (Red Phase): Test parsing logic for extracting titles, cinemas, and showtimes from mock HTML.
    - [ ] Implement (Green Phase): Implement Colly callbacks, parse HTML, and feed results through channels.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Filmweb Scraper (Concurrent)' (Protocol in workflow.md)

## Phase 2: Letterboxd and TMDB Integrations
- [ ] Task: TMDB API Integration
    - [ ] Write Tests (Red Phase): Test concurrent fetching of metadata and posters using a mock HTTP client.
    - [ ] Implement (Green Phase): Write concurrent HTTP requests to TMDB and merge with movie data.
- [ ] Task: Letterboxd Integration
    - [ ] Write Tests (Red Phase): Test extraction/parsing of Letterboxd watchlists.
    - [ ] Implement (Green Phase): Build Letterboxd scraping/parsing logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Letterboxd and TMDB Integrations' (Protocol in workflow.md)

## Phase 3: Data Aggregation & Export
- [ ] Task: Orchestration in Main
    - [ ] Write Tests (Red Phase): Test the synchronization and merging of data from Filmweb, TMDB, and Letterboxd.
    - [ ] Implement (Green Phase): Coordinate channels and Goroutines in the main entrypoint (`cmd/scraper/main.go`).
- [ ] Task: Strict Parity JSON Export
    - [ ] Write Tests (Red Phase): Assert that the generated `data_go.json` strictly adheres to the existing Next.js frontend schema.
    - [ ] Implement (Green Phase): Write the final JSON export logic in `internal/export`.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Data Aggregation & Export' (Protocol in workflow.md)

## Phase 4: CI/CD Integration
- [ ] Task: GitHub Actions Updates
    - [ ] Write Tests (Red Phase): (Skip logic tests, test via dry-run or local action simulator if possible).
    - [ ] Implement (Green Phase): Configure `daily-scraper-go.yml` to execute the Go scraper concurrently with Python and upload `data_go.json` as an artifact or commit it.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: CI/CD Integration' (Protocol in workflow.md)