# Specification: Unified Search & Map Sync

## Overview
This track enhances the search functionality to support finding both cinemas and specific movies through a unified global search bar. When a movie is selected, the application will filter and dynamically adjust the map to display only the cinemas playing that selected movie.

## Functional Requirements

### 1. Unified Global Search
- The existing search bar must support querying both `Cinema` names and `Movie` titles simultaneously.
- The dropdown results must visually distinguish between Cinema results and Movie results (e.g., using icons, badges, or small subtitle text like "Cinema" / "Movie").

### 2. Map Filtering & Bounds Fitting
- **Movie Selection:** When a user selects a movie from the search results, the map must filter its markers to display *only* the cinemas where that movie is currently scheduled to play (based on the currently selected date and active filters).
- **Bounds Fitting:** After filtering the markers for a selected movie, the map must automatically adjust its zoom and center (`fitBounds`) so that all relevant cinemas are visible on the screen.

### 3. Clearing the Selection
- **Clear Button:** An "x" (clear) button must be present in the search bar when a selection is active or text is entered. Clicking it clears the search, removes the movie/cinema filter, and restores all markers.
- **Map Click to Clear:** Clicking on an empty area of the map must also clear the current selection and restore all markers.

## Non-Functional Requirements
- **Performance:** Filtering the map markers and calculating bounds should be efficient to ensure the map animation feels smooth and instantaneous.
- **UX Consistency:** The search dropdown should maintain its current visual style while adding the new distinction between result types.

## Acceptance Criteria
- [ ] Typing a query in the search bar returns matching movies and cinemas, clearly distinguished.
- [ ] Selecting a movie from the search results filters the map to only show relevant cinemas.
- [ ] Selecting a movie from the search results automatically fits the map bounds to show all those relevant cinemas.
- [ ] Clicking the "x" in the search bar clears the selection and restores the map.
- [ ] Clicking an empty area on the map clears the selection and restores the map.

## Out of Scope
- Advanced fuzzy search (existing basic substring matching is sufficient unless otherwise required).
- Persisting search state across page reloads.