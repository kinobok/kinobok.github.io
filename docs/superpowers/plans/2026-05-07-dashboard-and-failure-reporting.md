# Dashboard and Failure Reporting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a scraping failure reporting mechanism and a frontend dashboard to display scrape metadata and failures.

**Architecture:** 
- Enhance the Python scraper to track failures (TMDB, Letterboxd, Filmweb) and export them in a new `metadata` field in `data.json`.
- Create a `DashboardModal` React component in the frontend to visualize this metadata.
- Add a trigger in the `SearchBar` to open the dashboard.

**Tech Stack:** Python (Pydantic, httpx, BeautifulSoup), React (Next.js, TypeScript), CSS.

---

### Task 1: Update Scraper Export Schema

**Files:**
- Modify: `scraper/export.py`
- Test: `scraper/tests/test_export.py`

- [ ] **Step 1: Update `ExportSchema` and `export_to_json`**

```python
# scraper/export.py

class FailureModel(BaseModel):
    title: str
    reason: str
    details: Optional[str] = None

class MetadataModel(BaseModel):
    last_scrape: str
    total_movies: int
    available_dates: List[str]
    failures: List[FailureModel]

class ExportSchema(BaseModel):
    movies: List[MovieModel]
    cinemas: List[CinemaModel]
    showtimes: Dict[str, List[ShowtimeModel]]
    metadata: MetadataModel

def export_to_json(
    movies: List[Dict],
    cinemas: List[Dict],
    showtimes: Dict[str, List[Dict]],
    metadata: Dict,
    output_file: str,
):
    try:
        data = ExportSchema(
            movies=movies, 
            cinemas=cinemas, 
            showtimes=showtimes,
            metadata=metadata
        )
        # ... rest of function
```

- [ ] **Step 2: Update existing tests in `scraper/tests/test_export.py` to include metadata**

- [ ] **Step 3: Run tests and verify they pass**

Run: `pytest scraper/tests/test_export.py`

---

### Task 2: Implement Failure Tracking in Scraper

**Files:**
- Modify: `scraper/main.py`

- [ ] **Step 1: Initialize failures list and metadata**
- [ ] **Step 2: Catch and record failures during movie processing (TMDB search, Letterboxd resolution)**
- [ ] **Step 3: Update `export_to_json` call to include metadata**

---

### Task 3: Create Frontend Dashboard Modal

**Files:**
- Create: `frontend/components/DashboardModal.tsx`
- Modify: `frontend/app/globals.css`

- [ ] **Step 1: Create `DashboardModal` component**
- [ ] **Step 2: Add styling for the modal in `globals.css`**

---

### Task 4: Integrate Dashboard into Frontend

**Files:**
- Modify: `frontend/app/page.tsx`
- Modify: `frontend/components/SearchBar.tsx`
- Modify: `frontend/utils/matching_logic.ts` (if needed for types)

- [ ] **Step 1: Update `CinemaData` type in `frontend/utils/matching_logic.ts`**
- [ ] **Step 2: Update `Home` component to handle metadata and `showDashboard` state**
- [ ] **Step 3: Add dashboard button to `SearchBar`**
- [ ] **Step 4: Verify integration by running the frontend locally**

---

### Task 5: End-to-End Verification

- [ ] **Step 1: Run scraper to generate fresh `data.json` with metadata**
- [ ] **Step 2: Open frontend and verify dashboard displays correct information**
- [ ] **Step 3: Commit all changes**
