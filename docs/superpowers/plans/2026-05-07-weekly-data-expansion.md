# Weekly Data Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand kinꚘbok to serve a full 7-day window of showtimes with a daily timeline in the frontend.

**Architecture:** 
- **Scraper:** Transition `showtimes` to a date-indexed dictionary. Implement a sliding window strategy: full 7-day scrape on Wednesdays, incremental `day=6` scrape on other days.
- **Frontend:** Add `selectedDate` state to `Home` component. Update matching logic to filter by day. Introduce a `DateSelector` timeline component.

**Tech Stack:** Python (httpx, BeautifulSoup, pydantic), TypeScript (Next.js, React).

---

### Task 1: Update Scraper Export Logic & Schema

**Files:**
- Modify: `scraper/export.py`
- Modify: `scraper/tests/test_export.py`

- [ ] **Step 1: Update `ExportSchema` in `scraper/export.py` to support nested showtimes**
- [ ] **Step 2: Update `export_to_json` function signature and implementation**
- [ ] **Step 3: Update `test_export_to_json_valid_data` in `scraper/tests/test_export.py` to match the new schema**
- [ ] **Step 4: Run tests and commit**

---

### Task 2: Update FilmwebScraper for Multi-Day Scraping

**Files:**
- Modify: `scraper/filmweb_scraper.py`
- Modify: `scraper/tests/test_filmweb.py`

- [ ] **Step 1: Update `get_warsaw_movies` to support `day_offset` and date extraction**
- [ ] **Step 2: Update `scraper/tests/test_filmweb.py` to handle the new return type**
- [ ] **Step 3: Run tests and commit**

---

### Task 3: Implement Main Scraper Loop with Sliding Window

**Files:**
- Modify: `scraper/main.py`

- [ ] **Step 1: Refactor `main()` to implement Wednesday and Sliding Window logic**
- [ ] **Step 2: Run a trial scrape (if possible) and commit**

---

### Task 4: Update Frontend Matching Logic

**Files:**
- Modify: `frontend/utils/matching_logic.ts`
- Modify: `frontend/tests/matching.test.ts`

- [ ] **Step 1: Update `findMatchesWithFilters` in `frontend/utils/matching_logic.ts`**
- [ ] **Step 2: Update `frontend/tests/matching.test.ts` to match the new signature and data structure**
- [ ] **Step 3: Run frontend tests and commit**

---

### Task 5: Add DateSelector Component

**Files:**
- Create: `frontend/components/DateSelector.tsx`

- [ ] **Step 1: Implement the `DateSelector` component**
- [ ] **Step 2: Add styles to `frontend/app/globals.css`**

---

### Task 6: Integrate DateSelector and Multi-Day Support in Home Page

**Files:**
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Update `Home` component to manage `selectedDate`**
- [ ] **Step 2: Verify the full flow and commit**
