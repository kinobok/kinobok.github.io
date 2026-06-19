# Implementation Plan: UX Revamp for Map Points & Searchbar Typeahead

## Phase 1: Searchbar Typeahead & Clearing Logic
- [x] Task: Write Tests for Searchbar Typeahead and Clear Button (d0a15c2)
    - [x] Create tests in `frontend/tests/` to verify typeahead dropdown renders when input length > 1.
    - [x] Write test for the `X` (Clear) button appearing when input is populated and clearing input when clicked.
- [x] Task: Implement Searchbar Typeahead (ed3c290)
    - [x] Add state for typeahead suggestions in `SearchBar.tsx` or parent component.
    - [x] Implement dropdown UI below the search input listing matching cinema names based on existing `data.cinemas`.
- [x] Task: Implement Clear Button (ed3c290)
    - [x] Add the `X` icon from `lucide-react` to `SearchBar.tsx`.
    - [x] Wire up the click handler to clear the search query and the selected cinema state.
- [~] Task: Conductor - User Manual Verification 'Phase 1: Searchbar Typeahead & Clearing Logic' (Protocol in workflow.md)

## Phase 2: Map Point Click Integration & Global Selection State
- [x] Task: Write Tests for Map Point Selection State (f91e540)
    - [x] Update map tests or sidebar tests to verify that a selected cinema ID filters the `matches` list.
    - [x] Verify that clicking empty map space clears the selected cinema state.
- [x] Task: Implement Global Selected Cinema State (a86fa91)
    - [x] Lift state up to `page.tsx` (e.g., `selectedCinemaId`) to manage the currently focused cinema.
    - [x] Pass the setter down to `CinemaMap` (for marker clicks and map background clicks) and `SearchBar` (for typeahead clicks).
- [x] Task: Apply Filtering to MatchSidebar (a86fa91)
    - [x] Update the `matches` prop passed to `MatchSidebar` to be filtered by `selectedCinemaId` if it is set.
- [~] Task: Conductor - User Manual Verification 'Phase 2: Map Point Click Integration & Global Selection State' (Protocol in workflow.md)

## Phase 3: Sidebar Enhancements (Toggle & Minimized State)
- [x] Task: Write Tests for Sidebar Enhancements (db081e6)
    - [x] Test the presence and toggle behavior of the "Show all screenings" button in `MatchSidebar`.
    - [x] Test the "minimized" state rendering ("Tap to see screenings" and `ChevronUp`) when expanded is false and state is minimized.
- [~] Task: Implement "Show all screenings" Toggle
    - [~] Add the toggle UI to `MatchSidebar` and wire it up using the existing `onToggleShowAllScreenings` handler from `page.tsx`.
- [~] Task: Implement Minimized State UX
    - [~] Update `MatchSidebar` mobile logic: Add a third state or adjust `isExpanded=false` to represent the "almost completely hidden" minimized state.
    - [~] Render the `ChevronUp` and "Tap to see screenings" label in this minimized state.
    - [~] Update `handleTouchEnd` swipe logic and empty map click logic to trigger this minimized state.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Sidebar Enhancements' (Protocol in workflow.md)