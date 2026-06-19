# Specification: UX Revamp for Map Points & Searchbar Typeahead

## Overview
This track introduces interactive enhancements for exploring cinemas via the map and search bar. It connects map interactions and search typeaheads directly to the `MatchSidebar` filtering, allowing users to drill down into specific cinema schedules quickly. Additionally, it refines the mobile sidebar behavior with a minimized state that mimics standard mapping applications.

## Functional Requirements
- **Cinema Filtering via Map Point:**
  - Clicking on a cinema marker on the map must filter the `MatchSidebar` to display screenings *only* from that specific cinema.
- **Searchbar Typeahead:**
  - Typing in the `SearchBar` should display typeahead suggestions for "Cinema Names" (appearing after typing 2+ characters).
  - Clicking a typeahead suggestion for a cinema must apply the same filtering behavior as clicking a map point (filter sidebar to that cinema).
- **Clearing Selection:**
  - A "Clear" button (using the `X` icon from `lucide-react`) must be added to the `SearchBar`.
  - Clicking the "Clear" button removes the cinema filter and clears the search input.
  - Clicking on an empty space on the map (not a cinema point) must also clear the cinema selection/filter.
- **Match Sidebar Enhancements:**
  - Add a toggle button directly in the `MatchSidebar` to enable/disable the "Show all screenings" setting (mirroring the functionality currently available in the `ConfigMenu`).
- **Minimized Mobile Sidebar:**
  - Users must be able to minimize the `MatchSidebar` almost completely using a swipe-down motion or by clicking on an empty area of the map.
  - In this "minimized" state, the sidebar should display a `ChevronUp` icon and a label stating "Tap to see screenings".
  - Clicking the chevron or the label restores the sidebar to its default expanded state.

## Non-Functional Requirements
- **Styling:** Maintain the established cinematic, minimalist dark theme. Use `lucide-react` for any new icons (`X`, `ChevronUp`).
- **Responsiveness:** The minimized state and swipe gestures are primarily targeted at mobile usage, matching Google Maps' UX.

## Acceptance Criteria
- [ ] Map marker click filters the sidebar to that cinema.
- [ ] Searchbar provides cinema name typeahead suggestions.
- [ ] Clicking a typeahead suggestion filters the sidebar to that cinema.
- [ ] Searchbar has an `X` button that clears the search and the cinema filter.
- [ ] Clicking empty map space clears the cinema filter and minimizes the mobile sidebar.
- [ ] `MatchSidebar` contains a working "Show all screenings" toggle.
- [ ] Mobile sidebar can be swiped down to a minimized state showing "Tap to see screenings" and a `ChevronUp` icon.
- [ ] Clicking the minimized sidebar expands it back to normal.

## Out of Scope
- Backend modifications; filtering and typeaheads should rely on existing client-side data (`data.json`).
- Complex search logic beyond cinema names (e.g., full-text movie search inside the typeahead dropdown is out of scope for this specific interaction).