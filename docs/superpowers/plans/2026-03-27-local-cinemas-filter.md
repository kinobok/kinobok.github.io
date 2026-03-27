# Local Cinemas Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement granular cinema filtering to prioritize independent cinemas, with "Helios" visible by default and other big chains hidden unless toggled.

**Architecture:** Centralized filtering and matching logic in the parent component (`page.tsx`). State flows down into `MatchSidebar` and `CinemaMap`. Matches update reactively as filters or watchlist changes.

**Tech Stack:** Next.js (App Router), TypeScript, Vitest (for testing).

---

### Task 1: Update Matching Utility & Tests

**Files:**
- Modify: `frontend/tests/matching.test.ts`
- Create: `frontend/utils/matching_logic.ts`

- [ ] **Step 1: Write a failing test for granular chain filtering**

Add a test case in `frontend/tests/matching.test.ts` for the `isVisible` and `findMatchesWithFilters` logic.

```typescript
// Add to matching.test.ts
import { isVisible, findMatchesWithFilters } from '../utils/matching_logic';

describe('Filtering Logic', () => {
  const cinemas = [
    { id: 'c1', name: 'Kino Muranów' }, // Independent
    { id: 'c2', name: 'Multikino Złote Tarasy' },
    { id: 'c3', name: 'Helios Blue City' },
    { id: 'c4', name: 'Cinema City Arkadia' },
    { id: 'c5', name: 'IMAX Sadyba' }
  ];

  it('should correctly identify visible cinemas based on active chains', () => {
    const visibleChains = ['Helios'];
    expect(isVisible('Kino Muranów', visibleChains)).toBe(true);
    expect(isVisible('Multikino Złote Tarasy', visibleChains)).toBe(false);
    expect(isVisible('Helios Blue City', visibleChains)).toBe(true);
    expect(isVisible('Cinema City Arkadia', visibleChains)).toBe(false);
    expect(isVisible('IMAX Sadyba', visibleChains)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test` in `frontend/` directory.
Expected: FAIL (missing exports from `matching_logic.ts`).

- [ ] **Step 3: Implement matching logic in `frontend/utils/matching_logic.ts`**

```typescript
export function isVisible(cinemaName: string, visibleChains: string[]) {
  const name = cinemaName.toLowerCase();
  
  const categories: { [key: string]: string[] } = {
    'Multikino': ['multikino'],
    'Cinema City': ['cinema city', 'imax'],
    'Helios': ['helios']
  };

  for (const [category, prefixes] of Object.entries(categories)) {
    if (prefixes.some(p => name.startsWith(p))) {
      return visibleChains.includes(category);
    }
  }

  return true; // Independent
}

export function findMatchesWithFilters(
  watchlistUris: string[], 
  data: any, 
  visibleChains: string[]
) {
  const filteredCinemas = data.cinemas.filter((c: any) => isVisible(c.name, visibleChains));
  const filteredCinemaIds = new Set(filteredCinemas.map((c: any) => c.id));

  const matchingMovies = data.movies.filter((movie: any) => watchlistUris.includes(movie.boxd_uri));
  
  const finalMatches = matchingMovies.map((movie: any) => {
    const relevantShowtimes = data.showtimes.filter((s: any) => 
      s.movie_id === movie.id && filteredCinemaIds.has(s.cinema_id)
    );
    
    if (relevantShowtimes.length === 0) return null;

    return {
      ...movie,
      showtimes: relevantShowtimes.map((s: any) => ({
        cinema: data.cinemas.find((c: any) => c.id === s.cinema_id)?.name,
        times: s.times,
        cinema_id: s.cinema_id // Keep ID for highlighting
      }))
    };
  }).filter(Boolean);

  const matchedCinemaIds = Array.from(new Set(finalMatches.flatMap((m: any) => m.showtimes.map((s: any) => s.cinema_id))));

  return {
    matches: finalMatches,
    filteredCinemas,
    matchedCinemaIds
  };
}
```

- [ ] **Step 4: Run tests and verify success**

Run: `npm run test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/matching.test.ts frontend/utils/matching_logic.ts
git commit -m "feat: implement granular cinema filtering logic with tests"
```

---

### Task 2: Update Parent Component (`page.tsx`)

**Files:**
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Integrate state and matching logic in `page.tsx`**

Move matching logic out of `MatchSidebar` and into `page.tsx` using the new utility.

- Add state for `watchlistUris` (string[]) and `visibleChains` (string[], default: `['Helios']`).
- Use `useMemo` to compute `{ matches, filteredCinemas, matchedCinemaIds }` based on `watchlistUris`, `visibleChains`, and the raw `data`.
- Update `MatchSidebar` props: pass `matches`, `visibleChains`, and callbacks `onWatchlistUpload`, `onToggleChain`.
- Update `CinemaMap` props: pass `filteredCinemas` (instead of `data.cinemas`) and `matchedCinemaIds`.

- [ ] **Step 2: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "feat: lift matching and filtering state to Home component"
```

---

### Task 3: Update `MatchSidebar` Component

**Files:**
- Modify: `frontend/components/MatchSidebar.tsx`

- [ ] **Step 1: Update component to be stateless and add Advanced Filters UI**

- Refactor to receive `matches`, `visibleChains`, `onWatchlistUpload`, `onToggleChain`.
- Add an "Advanced Filters" section with a "Show Advanced Filters" toggle (stateful within the component).
- Use a simple layout for checkboxes: Multikino, Cinema City (includes IMAX), Helios.
- Ensure independent cinemas aren't toggleable (they are always visible).
- Style with basic CSS to look clean.

- [ ] **Step 2: Commit**

```bash
git add frontend/components/MatchSidebar.tsx
git commit -m "feat: add advanced filtering UI to sidebar"
```

---

### Task 4: Verify Full Integration

- [ ] **Step 1: Run manual verification in browser**

- Verify only Independent + Helios cinemas show on map initially.
- Upload `docs/samples/watchlist.csv`.
- Verify matches only include Independent + Helios cinemas.
- Toggle "Multikino" in Advanced Filters.
- Verify Map and Sidebar update reactively.

- [ ] **Step 2: Final Commit**

```bash
git commit -m "docs: complete implementation of local cinema filtering feature"
```
