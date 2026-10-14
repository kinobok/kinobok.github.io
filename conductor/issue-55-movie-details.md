# Implementation Plan: Add Ratings, Number of Ratings, and Movie Length to Film Cards (Issue #55)

## Objective
Enrich movie data with ratings (`vote_average`), number of ratings (`vote_count`), and movie length (`runtime` in minutes) sourced exclusively from the TMDB API. Export these fields in `data_go.json` and display them on film cards in `MatchSidebar` (e.g. `★ 7.8 (1.4k) • 115 min`).

---

## User Preferences & Acceptance Criteria
- **Rating & Vote Count format**: `★ Rating (Vote Count)` (e.g. `★ 7.8 (1.4k)`).
- **Movie Length format**: Minutes only (e.g. `115 min`).
- **Data Source**: TMDB API only (`/3/search/movie` and `/3/movie/{id}`).
- **Graceful degradation**: If any metric is missing or 0, omit it cleanly without breaking layout.

---

## Key Files & Context

### 1. Data Domain (`scraper_go`)
- **`scraper_go/internal/tmdb/tmdb.go`**:
  - Extend `Movie` struct with `VoteAverage float64`, `VoteCount int`, and `Runtime int`.
  - In `SearchMovie`, parse `VoteAverage` and `VoteCount` from search results.
  - Add `GetMovieDetails(movieID int) (*MovieDetails, error)` or fetch movie details to populate `Runtime` (and precise votes).
  - Update `SearchMovie` to fetch movie details if runtime is needed.
- **`scraper_go/internal/tmdb/tmdb_test.go`**:
  - Test searching movies and retrieving rating, vote count, and runtime from mocked TMDB API endpoints.
- **`scraper_go/internal/export/export.go`**:
  - Extend `MovieModel` with `Rating *float64`, `VoteCount *int`, `Runtime *int`.
- **`scraper_go/internal/export/export_test.go`**:
  - Unit tests verifying JSON serialization and validation of `MovieModel` with ratings and runtime.
- **`scraper_go/cmd/scraper/main.go`**:
  - Populate `Rating`, `VoteCount`, and `Runtime` when constructing `export.MovieModel`.
- **`frontend/public/data_go.json`**:
  - Enrich sample movies with `rating`, `vote_count`, and `runtime` for local testing and UI demonstration.

### 2. Frontend Domain (`frontend`)
- **`frontend/utils/matching_logic.ts`**:
  - Update `Movie` and `Match` interfaces with optional `rating?: number`, `vote_count?: number`, `runtime?: number`.
  - Add formatting helpers `formatVoteCount(count?: number): string | null` and `formatRuntime(minutes?: number): string | null`.
- **`frontend/components/MatchSidebar.tsx`**:
  - In `renderMovieCard`, render a metadata row between title and showtimes:
    - Star rating `★ {rating.toFixed(1)}` in `--lb-green`.
    - Vote count `({formatVoteCount(vote_count)})` in `--lb-text-secondary`.
    - Dot separator `•`.
    - Length `{runtime} min` in `--lb-text-secondary`.
- **`frontend/app/page.tsx`**:
  - Pass through `rating`, `vote_count`, and `runtime` when creating single-movie matches.
- **`frontend/tests/matching.test.ts`**:
  - Unit tests for `formatVoteCount`, `formatRuntime`, and match property preservation.
- **`frontend/tests/match_sidebar.test.tsx`**:
  - Unit tests verifying that ratings, vote counts, and runtime are rendered correctly in the film cards.

---

## Step-by-Step Implementation

### Phase 1: Data Domain Updates (Go Scraper)
1. Add `VoteAverage`, `VoteCount`, and `Runtime` to `tmdb.Movie`.
2. Implement TMDB details fetching (`/3/movie/{id}`) in `tmdb.go` to extract `runtime` (and votes).
3. Add unit tests in `tmdb_test.go` verifying that `SearchMovie` captures vote average, vote count, and runtime.
4. Extend `MovieModel` in `export.go` with `Rating`, `VoteCount`, `Runtime`.
5. Update `export_test.go` to test serialization and validation.
6. Connect `tmdbMovie` fields to `movieModel` in `scraper_go/cmd/scraper/main.go`.
7. Verify all Go tests pass: `cd scraper_go && go test ./...`.

### Phase 2: Frontend Data & Matching Logic
1. Update `Movie` and `Match` interfaces in `frontend/utils/matching_logic.ts`.
2. Implement and export `formatVoteCount` and `formatRuntime` in `frontend/utils/matching_logic.ts`.
3. Add unit tests in `frontend/tests/matching.test.ts`.

### Phase 3: MatchSidebar Film Cards & UI
1. Update `renderMovieCard` in `frontend/components/MatchSidebar.tsx` to display ratings, vote count, and length.
2. Update `frontend/app/page.tsx` movie selection mapping.
3. Add unit tests in `frontend/tests/match_sidebar.test.tsx` checking card rendering.
4. Backfill sample entries in `frontend/public/data_go.json` for immediate testing.

### Phase 4: Validation & Quality Checks
1. Run `cd scraper_go && go test ./...`.
2. Run `cd frontend && npm test`.
3. Run `cd frontend && npm run build` (or `npx prettier --check .`).
