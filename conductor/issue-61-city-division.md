# Implementation Plan: Divide Searching Cinemas by City (Issue #61)

## Objective
Divide matches found by city in the sidebar when the active search/map zone contains multiple cities, and enable bulk inclusion/exclusion of entire cities in the cinema configuration menu. Focus strictly on cities (no voivodeships). The change spans both the data domain (`scraper_go`, `data_go.json`) and the frontend domain (`matching_logic`, `MatchSidebar`, `ConfigMenu`).

---

## Key Files & Context

### 1. Data Domain
- **`scraper_go/internal/export/export.go`**: Defines `CinemaModel`. Add `City` (`json:"city"`).
- **`scraper_go/cmd/scraper/main.go`**: During cinema extraction, populate `City` (from the scraped city).
- **`scraper_go/internal/export/export_test.go`**: Unit tests verifying JSON serialization of `CinemaModel` with city.
- **`frontend/public/data_go.json`**: Enrich existing cinemas with `city` attribute.

### 2. Frontend Domain
- **`frontend/utils/matching_logic.ts`**:
  - Update `Cinema` interface to include `city: string`.
  - Add utility function `groupMatchesByCity(matches: Match[], cinemas: Cinema[]): Array<{ city: string; matches: Match[] }>`.
- **`frontend/components/MatchSidebar.tsx`**:
  - Detect whether visible matches span more than one city.
  - When multiple cities are present, render matches grouped by City under collapsible/sticky City Section Headers (e.g. `Warszawa (15)`, `Radom (3)`).
  - When only one city is visible, maintain the current flat list.
- **`frontend/components/ConfigMenu.tsx`**:
  - In the Cinemas filter tab, organize cinemas grouped by City with collapsible city sections and search.
  - Add a master/bulk checkbox per City header to exclude or include all cinemas in that city in one click.
  - Keep individual cinema toggles functional beneath each city header.
- **`frontend/tests/matching.test.ts`**: Unit test for `groupMatchesByCity`.
- **`frontend/tests/match_sidebar.test.tsx`**: Unit test verifying multi-city section headers vs single-city rendering.
- **`frontend/tests/config_menu.test.tsx`**: Unit test verifying bulk city cinema toggle and individual cinema updates.

---

## Detailed Implementation Steps

### Phase 1: Data Domain Updates
1. **Extend `CinemaModel` in `scraper_go/internal/export/export.go`**:
   ```go
   type CinemaModel struct {
       ID          string       `json:"id"`
       Name        string       `json:"name"`
       City        string       `json:"city"`
       Voivodeship string       `json:"voivodeship,omitempty"`
       Address     string       `json:"address"`
       Coords      *CoordsModel `json:"coords"`
   }
   ```
2. **City to Voivodeship Mapping in `scraper_go/cmd/scraper/main.go`**:
   - Create a lookup table covering Polish cities to voivodeships (Mazowieckie, Małopolskie, Dolnośląskie, Wielkopolskie, Pomorskie, Śląskie, Łódzkie, etc.).
   - When registering a `CinemaModel`, set `City: city` and `Voivodeship: cityToVoivodeship[city]`.
3. **Backfill `frontend/public/data_go.json`**:
   - Ensure every cinema in `data_go.json` has `city` and `voivodeship` populated based on address / city mapping.
4. **Go Tests**:
   - Run `go test ./...` in `scraper_go` to verify export schemas and existing tests pass.

### Phase 2: Frontend Data & Grouping Logic
1. **Update Types in `frontend/utils/matching_logic.ts`**:
   ```ts
   export interface Cinema {
     id: string;
     name: string;
     city?: string;
     voivodeship?: string;
     address: string;
     coords?: { lat: number; lng: number };
   }
   ```
2. **Implement `groupMatchesByCity` in `frontend/utils/matching_logic.ts`**:
   - Maps each match's showtimes to their cinema cities.
   - For matches appearing in multiple cities, assigns showtimes to the respective city section.
   - Returns a sorted list of `{ city: string, voivodeship?: string, matches: Match[] }`.
3. **Unit Tests in `frontend/tests/matching.test.ts`**:
   - Verify `groupMatchesByCity` correctly splits showtimes and groups matches by city.

### Phase 3: MatchSidebar Multi-City Section Headers
1. **Multi-City Detection in `MatchSidebar.tsx`**:
   - Identify unique cities among currently visible cinemas/matches.
   - If `uniqueCities.length > 1`:
     - Render section headers per city with movie counts: `📍 {city} ({count})`.
     - Render the movie cards for that city under its section header.
   - If `uniqueCities.length <= 1`:
     - Render the standard single list without unnecessary nesting headers.
2. **Unit Tests in `frontend/tests/match_sidebar.test.tsx`**:
   - Test that multi-city matches display city section headers.
   - Test that single-city matches render without headers.

### Phase 4: ConfigMenu Bulk City Exclusion
1. **Group Cinemas by City in `ConfigMenu.tsx`**:
   - In the Filters section, display cinemas grouped by City (e.g. `Warszawa (25)`, `Kraków (14)`).
   - Each city group header contains a checkbox showing:
     - Checked if all cinemas in the city are active.
     - Unchecked if all cinemas in the city are excluded.
     - Indeterminate if some are excluded.
   - Clicking the city checkbox toggles all cinemas in that city simultaneously (calls `onToggleCinema` or bulk exclude callback).
2. **Unit Tests in `frontend/tests/config_menu.test.tsx`**:
   - Test clicking a city's master checkbox excludes all cinemas in that city.
   - Test unchecking restores all cinemas.

### Phase 5: Verification & Quality Checks
1. Run all tests: `cd frontend && npm test`
2. Run Prettier: `npx prettier --check --ignore-path frontend/.gitignore "**/*.{ts,tsx}"`
3. Run Next.js build: `cd frontend && npm run build`
4. Run Go tests: `cd scraper_go && go test ./...`
5. Create branch `feat/61-divide-cinemas-by-city`, commit, push, and open PR.
