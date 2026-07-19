# Implementation Plan

## Phase 1: Map Bounds Filtering
- [x] Task: Implement Map Bounds Tracking
    - [x] Write failing test for state management or context providing map bounds.
    - [x] Update `CinemaMap.tsx` to expose the current map bounds on zoom/pan events.
- [x] Task: Filter Sidebar by Bounds
    - [x] Write failing test in `match_sidebar.test.tsx` for filtering movies based on bounds.
    - [x] Update `MatchSidebar.tsx` to filter cinemas/movies based on provided bounds.
- [x] Task: Selection Override
    - [x] Write failing test in `match_sidebar.test.tsx` verifying selected cinema overrides bounds filtering.
    - [x] Implement the override logic in `MatchSidebar.tsx`.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Map Bounds Filtering' (Protocol in workflow.md)

## Phase 2: Time-Based Filtering & Sorting
- [x] Task: Identify Past Screenings
    - [x] Write failing unit test for a utility function that compares a showtime string against the current time.
    - [x] Implement the time comparison utility.
- [x] Task: Update Sidebar Sorting and Styling
    - [x] Write failing tests for visual grey-out logic and sorting order (past movies at bottom) in `match_sidebar.test.tsx`.
    - [x] Update `MatchSidebar.tsx` and relevant CSS to apply grey-out styles to past times.
    - [x] Update sorting logic to push movies with no future screenings today to the bottom of the list.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Time-Based Filtering & Sorting' (Protocol in workflow.md)

## Phase 3: Visual Enhancements (Loader & Logo)
- [x] Task: Implement Animated Loading Screen
    - [x] Update the `page.tsx` loading state to display `kinobok.svg` instead of text.
    - [x] Add CSS animation (e.g., pulsing) to `globals.css` or the relevant module.
- [x] Task: Fix Logo Alignment in Chrome
    - [x] Update CSS classes in `GuidanceModal.tsx` and `ConfigMenu.tsx` to fix flex/centering behavior in Chrome.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Visual Enhancements (Loader & Logo)' (Protocol in workflow.md)