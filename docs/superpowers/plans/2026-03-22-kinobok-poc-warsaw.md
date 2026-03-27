# kinꚘbok Warsaw PoC Implementation Plan v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a privacy-first web app that matches a user's Letterboxd watchlist with Warsaw cinema showtimes.

**Architecture:** A Python scraper bridges Filmweb (PL) to Letterboxd (EN) via TMDB, generating a static `data.json`. The Next.js frontend performs 100% client-side matching using `boxd.it` URIs.

**Tech Stack:** Python (BS4, httpx), Next.js (App Router), TypeScript, Leaflet, Papaparse.

---

### Task 0: Environment Setup
**Files:**
- Create: `requirements.txt`
- Create: `frontend/package.json`

- [ ] **Step 1: Initialize `requirements.txt` with dependencies**
```text
beautifulsoup4
httpx
rapidfuzz
pydantic
pytest
```
- [ ] **Step 2: Initialize `frontend/package.json` with dependencies**
- [ ] **Step 3: Commit**
`git add requirements.txt frontend/package.json && git commit -m "chore: initialize environment dependencies"`

### Task 1: Python Scraper - Filmweb Showtimes
**Files:**
- Create: `scraper/filmweb_scraper.py`
- Create: `scraper/tests/test_filmweb.py`

- [ ] **Step 1: Write test for showtime scraping**
- [ ] **Step 2: Implement `FilmwebScraper`**
- [ ] **Step 3: Run test and verify results**
- [ ] **Step 4: Commit**
`git add scraper/ && git commit -m "feat: add Filmweb showtime scraper"`

### Task 2: TMDB Bridge & Letterboxd Slug Generation
**Files:**
- Create: `scraper/tmdb_scraper.py`
- Create: `scraper/slug_utils.py`
- Create: `scraper/tests/test_slugs.py`

- [ ] **Step 1: Write test for slug generation**
- [ ] **Step 2: Implement `generate_slug` and TMDB lookup**
- [ ] **Step 3: Run tests**
- [ ] **Step 4: Commit**
`git add scraper/ && git commit -m "feat: add TMDB bridge and slug generation"`

### Task 3: Letterboxd URI Resolution & Data Export
**Files:**
- Create: `scraper/letterboxd_scraper.py`
- Create: `scraper/export.py`
- Create: `scraper/tests/test_letterboxd.py`

- [ ] **Step 1: Write test for boxd.it extraction**
- [ ] **Step 2: Implement `LetterboxdScraper`**
- [ ] **Step 3: Implement `export_to_json` with schema validation**
- [ ] **Step 4: Run tests**
- [ ] **Step 5: Commit**
`git add scraper/ && git commit -m "feat: add Letterboxd URI resolution and data export"`

### Task 4: Frontend - Next.js Setup & CSV Parsing
**Files:**
- Create: `frontend/utils/csv_parser.ts`
- Create: `frontend/tests/csv_parser.test.ts`

- [ ] **Step 1: Write test for CSV URI extraction**
- [ ] **Step 2: Implement `parseWatchlist` using Papaparse**
- [ ] **Step 3: Run tests**
- [ ] **Step 4: Commit**
`git add frontend/ && git commit -m "feat: add client-side CSV parsing"`

### Task 5: Frontend - Warsaw Map Setup
**Files:**
- Create: `frontend/components/CinemaMap.tsx`
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Implement Leaflet map centered on Warsaw**
- [ ] **Step 2: Implement cinema marker display from `data.json`**
- [ ] **Step 3: Commit**
`git add frontend/ && git commit -m "feat: add initial Warsaw map view"`

### Task 6: Frontend - Match Sidebar & Reactive Highlighting
**Files:**
- Create: `frontend/components/MatchSidebar.tsx`
- Modify: `frontend/components/CinemaMap.tsx`

- [x] **Step 1: Implement sidebar for movie matching display**
- [x] **Step 2: Implement reactive marker highlighting for matches**
- [x] **Step 3: Connect matching logic to UI state**
- [x] **Step 4: Commit**
`git add frontend/ && git commit -m "feat: add match sidebar and reactive highlighting"`

### Task 7: Scraper - Integration & Daily Run Script
**Files:**
- Create: `scraper/main.py`
- Create: `.github/workflows/daily-scraper.yml`

- [x] **Step 1: Implement full orchestration in `scraper/main.py`**
- [x] **Step 2: Add logic for full Warsaw coverage (all movies)**
- [x] **Step 3: Export results directly to `frontend/public/data.json`**
- [x] **Step 4: Create GitHub Action for 4:00 AM daily run**
- [x] **Step 5: Commit**
`git add scraper/main.py .github/ && git commit -m "feat: add daily scraper runner and github action"`

### Task 8: Local Setup & Documentation
**Files:**
- Create: `README.md`

- [x] **Step 1: Create a comprehensive `README.md` with setup instructions**
- [x] **Step 2: Add instructions for local frontend run (`npm install && npm run dev`)**
- [x] **Step 3: Add instructions for local scraper run with `TMDB_API_KEY`**
- [x] **Step 4: Commit**
`git add README.md && git commit -m "docs: add local setup instructions"`
