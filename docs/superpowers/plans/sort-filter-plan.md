# Implementation Plan: Movie Sorting & Advanced Filtering

## 1. Objective
Implement advanced sorting and filtering capabilities in the kinꚘbok frontend:
- **Default Sorting:** "Rare Screenings" (fewest total screenings in the week, then fewest on the current day).
- **Movie Filtering:** Allow users to manually exclude specific movies from matches and the map. Provide a way to restore them.
- **Cinema Filtering:** Allow users to toggle the visibility of individual cinemas.
- **Date Selector Matches:** Show the number of watchlist matches for each day directly in the `DateSelector`.

## 2. Key Files & Context
- `frontend/utils/matching_logic.ts`: Core data interfaces, screening count logic, sorting logic, and extending `findMatchesWithFilters`. Also, a new utility to pre-calculate matches per day.
- `frontend/tests/matching.test.ts`: Unit tests for matching, sorting, and filtering logic.
- `frontend/app/page.tsx`: Application state management (`sortBy`, `excludedMovieIds`, `excludedCinemaIds`), local storage persistence, and passing props down. Pre-calculating match counts per day.
- `frontend/components/MatchSidebar.tsx`: Add the "Sort By" dropdown and an "Exclude" (✕) button for each matched movie card.
- `frontend/components/ConfigMenu.tsx`: Add sections for "Individual Cinemas" and "Manage Excluded Movies".
- `frontend/components/DateSelector.tsx`: Update to display the match count badge next to each date.
- `frontend/app/globals.css`: Additional styling for the new UI elements if required.

## 3. Implementation Steps

### Phase 1: Data Logic & Unit Tests (`matching_logic.ts` & `matching.test.ts`)
1. **Extend Interfaces:** Update `Match` to optionally include rarity counts (or calculate on the fly).
2. **Implement Metrics:** Create utility functions to calculate `weekScreenings` and `dayScreenings` for a movie using `data.showtimes`.
3. **Extend `findMatchesWithFilters`:**
   - Add parameters: `excludedMovieIds: string[]`, `excludedCinemaIds: string[]`, `sortBy: string`.
   - Filter `filteredCinemas` using `excludedCinemaIds`.
   - Filter `matchingMovies` using `excludedMovieIds`.
   - Sort the resulting `finalMatches` based on the `sortBy` parameter:
     - `'rare-week'`: `weekScreenings` (asc) -> `dayScreenings` (asc) -> `title` (asc).
     - `'rare-day'`: `dayScreenings` (asc) -> `weekScreenings` (asc) -> `title` (asc).
     - `'alpha-asc'`: `title` (A-Z).
     - `'alpha-desc'`: `title` (Z-A).
4. **Update Tests:** Add test cases in `matching.test.ts` for the new sort orders, excluded movies, and excluded cinemas.

### Phase 2: State Management & Persistence (`page.tsx`)
1. **State Hooks:** Add `sortBy`, `excludedMovieIds`, and `excludedCinemaIds` states.
2. **Local Storage:** Hydrate these states from `localStorage` on initial load (e.g., `kinobok_sort_by`, `kinobok_excluded_movies`, `kinobok_excluded_cinemas`), and update `localStorage` when they change.
3. **Memoized Derivation:** Update the `useMemo` call for `findMatchesWithFilters` to pass the new parameters.
4. **Matches Per Day:** Add a `useMemo` block to calculate the number of matches for *every* available date (using current filters) to pass down to `DateSelector`.
5. **Prop Drilling:** Pass the new states and their respective setter/handler functions down to `MatchSidebar`, `ConfigMenu`, and `DateSelector`.

### Phase 3: Match Sidebar UI & Date Selector (`MatchSidebar.tsx`, `DateSelector.tsx`)
1. **Sort Dropdown:** Add a select dropdown next to or below the "Matches Found" header in `MatchSidebar`.
2. **Exclude Button:** Add a stylized "✕" (or eye-slash) button to each movie card in the list.
3. **Date Selector:** Update `DateSelectorProps` to accept a `matchCounts` record mapping dates to match numbers, and display a small badge/counter next to each day tab.

### Phase 4: Config Menu UI (`ConfigMenu.tsx`)
1. **Individual Cinemas Filter:**
   - Create a new section displaying a checklist of all available cinemas in the dataset.
   - Group them by chain (Multikino, Cinema City, Helios, Independent) or list alphabetically.
   - Use checkboxes controlled by the `excludedCinemaIds` state.
2. **Manage Excluded Movies:**
   - Create a section listing the titles of excluded movies (looked up from `data.movies`).
   - Add a "Restore" button next to each to remove it from `excludedMovieIds`.

## 4. Verification & Testing
- Run `npm run test` to verify `vitest` suite passes.
- Launch `npm run dev` and manually test:
  - Default sorting reflects rare screenings accurately.
  - Excluding a movie hides it from the sidebar and removes map markers if that was the only movie playing at a cinema.
  - Restoring the movie via ConfigMenu brings it back immediately.
  - Toggling individual cinemas in ConfigMenu updates the map markers and sidebar showtimes instantly.
  - Reloading the page persists the excluded movies, excluded cinemas, and selected sort method.