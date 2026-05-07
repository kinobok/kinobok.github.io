# Spec: Weekly Data Expansion

Expand the kinꚘbok scraper and frontend to provide a full 7-day overview of cinema showtimes in Warsaw.

## 1. Problem Statement
Users currently only see showtimes for the current day. They want to plan their cinema visits ahead of time for the full upcoming week.

## 2. Goals
- Scrape 7 days of showtimes instead of 1.
- Optimize scraper to run efficiently (full scrape on Wednesdays, incremental on other days).
- Update frontend to allow users to switch between days in the upcoming week.
- Maintain the map-centric and privacy-first nature of the application.

## 3. Data Schema Changes (`frontend/public/data.json`)
The `showtimes` property will transition from a flat array to an object keyed by ISO date strings (`YYYY-MM-DD`).

```json
{
  "movies": [
    { "id": "m1", "title": "Michael", "poster": "...", "boxd_uri": "..." }
  ],
  "cinemas": [
    { "id": "c1", "name": "Cinema City Mokotów", "address": "...", "coords": { "lat": 0, "lng": 0 } }
  ],
  "showtimes": {
    "2026-05-07": [
      { "movie_id": "m1", "cinema_id": "c1", "times": ["10:30", "13:20"] }
    ],
    "2026-05-08": [
      { "movie_id": "m1", "cinema_id": "c1", "times": ["12:00", "15:00"] }
    ]
  }
}
```

## 4. Scraper Strategy (`scraper/`)
The scraper will implement a **Sliding Window** strategy to balance data freshness and execution time.

### 4.1. Scraping Modes
- **Full Refresh (Wednesdays & Init):**
  - Iterates through `range(7)`.
  - Fetch `BASE_URL` for `day=0`.
  - Fetch `BASE_URL + "?day=N"` for `N` in `1..6`.
  - Fully replaces the `showtimes` object in `data.json`.
- **Incremental Update (Other Days):**
  - Loads existing `data.json`.
  - Drops showtime keys for dates earlier than today.
  - Fetches `BASE_URL + "?day=6"` to get the newest day in the window.
  - Updates the `showtimes` object and saves.

### 4.2. Implementation Details
- Extract the date for each day from the Filmweb page (e.g., from `data-date` attributes in the HTML).
- Ensure `movies` and `cinemas` lists are updated if a new movie or cinema appears in the extended window.

## 5. Frontend UI/UX (`frontend/`)

### 5.1. Date Selector (Timeline)
- Add a horizontal date selector component below the Search Bar or at the top of the Sidebar.
- Display 7 days (e.g., "Thu, 7 May", "Fri, 8 May", etc.).
- The first date with available data is selected by default.

### 5.2. Filtering Logic
- Update `findMatchesWithFilters` in `utils/matching_logic.ts` to take a `selectedDate` argument.
- Filter `data.showtimes[selectedDate]` instead of the global showtimes array.
- Update `Home` component in `page.tsx` to manage `selectedDate` state.

### 5.3. Interaction
- When a user clicks a different date:
  - `selectedDate` updates.
  - `useMemo` for `matches` re-calculates.
  - `CinemaMap` and `MatchSidebar` automatically refresh with the new data.

## 6. Testing Plan
- **Scraper:**
  - Verify `?day=N` parameter results in different dates.
  - Verify Wednesday logic vs. daily logic.
  - Test JSON export with nested `showtimes`.
- **Frontend:**
  - Verify the Date Selector renders the correct range of dates.
  - Verify switching dates correctly updates the map markers and sidebar results.
  - Verify performance remains smooth with larger `data.json`.
