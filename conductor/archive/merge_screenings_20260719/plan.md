# Implementation Plan

## Phase 1: Core Deduplication Utilities [checkpoint: 9245316]
- [x] Task: Implement Showtime Deduplication
    - [x] Write failing unit tests for a string slice deduplication function to handle exact time string matches.
    - [x] Implement the deduplication function (Green phase) to pass the tests.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core Deduplication Utilities' (Protocol in workflow.md)

## Phase 2: Scraper Integration [checkpoint: f1b69a0]
- [x] Task: Update Aggregation in `main.go`
    - [x] Update `cinemasMap` lookup to use case-insensitive names for finding existing cinemas.
    - [x] Modify the showtime aggregation logic to merge duplicate `ShowtimeModel` entries (matching `MovieID` and `CinemaID` on the same date) and deduplicate their `Times` array using the new utility.
    - [x] Ensure the final `data_go.json` export contains the deduplicated arrays.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Scraper Integration' (Protocol in workflow.md)
