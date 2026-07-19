# Specification: Frontend Enhancements & Fixes

## Overview
This track introduces user experience improvements and visual fixes to the kinobok frontend:
1. Syncing the sidebar list of movies/cinemas to the currently visible map region.
2. Greying out past screenings on the current date and moving movies with no remaining future screenings to the bottom of the list.
3. Replacing the text-based loading screen with an animated logo.
4. Fixing logo alignment issues on Chrome in the guidance modal and config menu.

## Functional Requirements

### 1. Map Bounds Filtering
- The application must capture the map's visible bounding box (`bounds` from Leaflet).
- The `MatchSidebar` must only display movies playing at cinemas whose coordinates fall within the current map bounds.
- **Selection Override:** If a user clicks a cinema marker on the map, that cinema and its movies must remain visible and highlighted in the sidebar, temporarily bypassing the bounds filter.

### 2. Time-Based Filtering & Sorting
- For the currently selected date (if it matches today's local date), the application must compare screening times against the current local time.
- Screenings that have already started (past times) must be visually greyed out or muted.
- Movies that have *no* future screenings remaining for the day must be pushed to the bottom of the sidebar list, keeping the primary sorting intact for movies with upcoming screenings.

### 3. Loading Screen
- The initial loading state ("loading kinobok...") must be replaced with the `kinobok.svg` logo.
- The logo must feature a subtle CSS animation (e.g., pulsing) to indicate loading activity.

### 4. Logo Alignment Fix
- The layout for the `kinobok` logo in the Guidance Modal and Config Menu must be adjusted to ensure perfect horizontal/vertical centering across browsers, specifically addressing a known rendering quirk in Google Chrome.

## Non-Functional Requirements
- **Performance:** Map bounds filtering must happen efficiently without causing lag during panning or zooming (e.g., debouncing the bounds update).
- **Cross-Browser:** The alignment fixes must not break the layout in Safari or Firefox.

## Acceptance Criteria
- [ ] Panning/zooming the map updates the sidebar to only show movies from visible cinemas.
- [ ] Clicking a cinema marker ensures its movies are shown in the sidebar regardless of subsequent minor panning.
- [ ] Past screenings on the current date are visually greyed out.
- [ ] Movies with no upcoming screenings today appear at the bottom of the sidebar list.
- [ ] The loading screen displays the animated `kinobok.svg` logo instead of plain text.
- [ ] The logo is perfectly centered in the Guidance Modal and Config Menu on Chrome.

## Out of Scope
- Time-based filtering for dates other than today (e.g., tomorrow).
- Backend or scraper modifications.