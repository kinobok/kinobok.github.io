# Local Cinemas Filter & Exclude Big Chains Design Spec

**Date:** 2026-03-27
**Topic:** Kinobok - Local Cinemas Filter
**Status:** In Review

## 1. Overview
The goal of this feature is to encourage users of Kinobok to visit local, independent cinemas in Warsaw. By default, major commercial chains ("Multikino" and "Cinema City/IMAX") will be filtered out, while "Helios" (often appreciated by cinephiles) and independent cinemas remain visible. An "Advanced Filters" section will allow users to granularly toggle each chain.

## 2. Success Criteria
- By default, independent cinemas and Helios are visible.
- Multikino and Cinema City (including IMAX) are hidden by default.
- An "Advanced Filters" UI allows toggling each major chain individually.
- The "Matches Found" sidebar and Map update reactively based on these filters.

## 3. Architecture & Data Flow

### 3.1. State Management (`page.tsx`)
- `visibleChains` (string[]): A list of active big chains. Initial value: `['Helios']`.
- `watchlistUris` (string[]): Stores the Letterboxd URIs parsed from the user's uploaded CSV.

### 3.2. Filtering Logic
We categorize big chains into three groups:
1.  **Multikino**: Names starting with "Multikino".
2.  **Cinema City**: Names starting with "Cinema City" or "IMAX".
3.  **Helios**: Names starting with "Helios".

**Visibility Rule:**
A cinema is visible if:
- It does **not** belong to any of the categories above (Independent).
- OR it belongs to a category that is present in the `visibleChains` state.

- **Filtered Cinemas:** `data.cinemas.filter(c => isVisible(c.name, visibleChains))`
- **Filtered Showtimes:** `data.showtimes.filter(s => filteredCinemas.some(fc => fc.id === s.cinema_id))`

### 3.3. Matching Logic
Matches are recalculated reactively:
1. Filter movies from `data.movies` that exist in `watchlistUris`.
2. Map these movies to their showtimes *only within the currently filtered cinemas*.
3. Filter out any movies from the `matches` array that have zero showtimes in the current filtered set.

## 4. Component Interfaces

### 4.1. `MatchSidebar` Props
- `matches`: Array of matched movies with their filtered showtimes.
- `visibleChains`: Current list of active big chains.
- `onWatchlistUpload`: Callback returning the parsed `watchlistUris`.
- `onToggleChain`: Callback to add/remove a chain from the `visibleChains` list.

### 4.2. `CinemaMap` Props
- `cinemas`: Array of currently filtered cinemas.
- `highlightedCinemaIds`: Array of IDs for cinemas that have matches.

## 5. UI Requirements
- **Default Sidebar State:** A simple message like "Showing Local Cinemas & Helios".
- **Advanced Options:** A clickable "Advanced Filters" link/button that expands to show checkboxes for:
    - [ ] Multikino
    - [ ] Cinema City (includes IMAX)
    - [x] Helios
- The UI should clearly communicate that unchecking these hides them from the map and matching results.

## 6. Implementation Plan Highlights
- Update `page.tsx` to handle matching and filtering logic.
- Refactor `MatchSidebar.tsx` to be more "stateless" regarding the matching results, receiving them instead as props.
- Ensure `watchlistUris` are persisted in state after upload.
