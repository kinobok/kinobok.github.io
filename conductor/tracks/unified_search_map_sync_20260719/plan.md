# Implementation Plan

## Phase 1: Unified Search & Selection
- [ ] Task: Update SearchBar Component
    - [ ] Update `SearchBar.tsx` to accept both `allCinemas` and `allMovies` as props.
    - [ ] Modify the internal search logic to query both datasets and combine the results.
    - [ ] Update the dropdown UI to distinguish between "Movie" and "Cinema" results (e.g., icons or tags).
    - [ ] Add the clear ("x") button to the input field and implement `onClear` logic.
    - [ ] Add/Update tests in `search_bar.test.tsx` to verify unified results, visual distinctions, and clear button functionality.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Unified Search & Selection' (Protocol in workflow.md)

## Phase 2: Page State & Map Integration
- [ ] Task: Manage Selected Movie State
    - [ ] Add `selectedMovieId` state to `page.tsx`.
    - [ ] Update `handleSelectCinema` and create `handleSelectMovie` to manage these states (ensuring they are mutually exclusive or clear each other appropriately).
    - [ ] Update the `matches` and `filteredCinemas` `useMemo` block in `page.tsx` to filter `filteredCinemas` down to only those showing the `selectedMovieId` when a movie is selected.
- [ ] Task: Map Bounds Fitting & Click-to-Clear
    - [ ] Update `CinemaMap.tsx` to accept a `fitBoundsCinemas` prop (or use the filtered cinemas list) and utilize Leaflet's `map.fitBounds()` when this list changes due to a movie selection.
    - [ ] Ensure `MapEventsController` in `CinemaMap.tsx` triggers a clear action when the map is clicked, clearing both selected cinema and selected movie.
    - [ ] Write/Update tests in `cinema_selection.test.tsx` to verify the new filtering behavior when a movie is selected.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Page State & Map Integration' (Protocol in workflow.md)