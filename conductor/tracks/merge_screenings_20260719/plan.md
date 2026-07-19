# Implementation Plan

## Phase 1: Core Deduplication Utilities
- [ ] Task: Implement Showtime Deduplication
    - [ ] Write failing unit tests for a string slice deduplication function to handle exact time string matches.
    - [ ] Implement the deduplication function (Green phase) to pass the tests.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core Deduplication Utilities' (Protocol in workflow.md)

## Phase 2: Scraper Integration
- [ ] Task: Update Aggregation in `main.go`
    - [ ] Update `cinemasMap` lookup to use case-insensitive names for finding existing cinemas.
    - [ ] Modify the showtime aggregation logic to merge duplicate `ShowtimeModel` entries (matching `MovieID` and `CinemaID` on the same date) and deduplicate their `Times` array using the new utility.
    - [ ] Ensure the final `data_go.json` export contains the deduplicated arrays.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Scraper Integration' (Protocol in workflow.md)
