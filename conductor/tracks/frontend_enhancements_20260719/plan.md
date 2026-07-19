# Implementation Plan

## Phase 1: Map Bounds Filtering
- [ ] Task: Implement Map Bounds Tracking
    - [ ] Write failing test for state management or context providing map bounds.
    - [ ] Update `CinemaMap.tsx` to expose the current map bounds on zoom/pan events.
- [ ] Task: Filter Sidebar by Bounds
    - [ ] Write failing test in `match_sidebar.test.tsx` for filtering movies based on bounds.
    - [ ] Update `MatchSidebar.tsx` to filter cinemas/movies based on provided bounds.
- [ ] Task: Selection Override
    - [ ] Write failing test in `match_sidebar.test.tsx` verifying selected cinema overrides bounds filtering.
    - [ ] Implement the override logic in `MatchSidebar.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Map Bounds Filtering' (Protocol in workflow.md)

## Phase 2: Time-Based Filtering & Sorting
- [ ] Task: Identify Past Screenings
    - [ ] Write failing unit test for a utility function that compares a showtime string against the current time.
    - [ ] Implement the time comparison utility.
- [ ] Task: Update Sidebar Sorting and Styling
    - [ ] Write failing tests for visual grey-out logic and sorting order (past movies at bottom) in `match_sidebar.test.tsx`.
    - [ ] Update `MatchSidebar.tsx` and relevant CSS to apply grey-out styles to past times.
    - [ ] Update sorting logic to push movies with no future screenings today to the bottom of the list.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Time-Based Filtering & Sorting' (Protocol in workflow.md)

## Phase 3: Visual Enhancements (Loader & Logo)
- [ ] Task: Implement Animated Loading Screen
    - [ ] Update the `page.tsx` loading state to display `kinobok.svg` instead of text.
    - [ ] Add CSS animation (e.g., pulsing) to `globals.css` or the relevant module.
- [ ] Task: Fix Logo Alignment in Chrome
    - [ ] Update CSS classes in `GuidanceModal.tsx` and `ConfigMenu.tsx` to fix flex/centering behavior in Chrome.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Visual Enhancements (Loader & Logo)' (Protocol in workflow.md)