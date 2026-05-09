# Filmweb Original Title Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve TMDB matching accuracy by extracting original titles and production years from Filmweb showtimes pages.

**Architecture:** Enrich the `FilmwebScraper` to return `original_title` and `year` along with the Polish `title`. Update the `main.py` loop to prioritize the `original_title` and use the `year` in TMDB searches.

**Tech Stack:** Python, BeautifulSoup4, httpx, pytest.

---

### Task 1: Research and Mock Setup

**Files:**
- Create: `scraper/tests/mock_showtimes.html` (for testing reference)

- [ ] **Step 1: Save a mock HTML snippet of a showtimes page**
We already have the snippet from our research. Let's create a small file to use in unit tests.

```python
# No code here, just a task to ensure we have the data for the next step.
```

- [ ] **Step 2: Commit**
```bash
git commit -m "test: prepare mock data for filmweb extraction" --allow-empty
```

### Task 2: Update FilmwebScraper Extraction Logic

**Files:**
- Modify: `scraper/filmweb_scraper.py`
- Test: `scraper/tests/test_filmweb_unit.py` (New file for unit testing)

- [ ] **Step 1: Write a unit test with mocked HTML**
Create `scraper/tests/test_filmweb_unit.py` and add a test that checks for `original_title` and `year`.

```python
import pytest
from bs4 import BeautifulSoup
from scraper.filmweb_scraper import FilmwebScraper

def test_extract_movie_metadata():
    html = """
    <div class="preview__header">
        <h2 class="preview__title"><a class="preview__link" href="/film/Projekt+Hail+Mary-2026-10047841">Projekt Hail Mary</a></h2>
        <div class="preview__headerDetails">
            <div class="preview__alternateTitle">Project Hail Mary</div><wbr>
            <div class="preview__year">2026</div>
        </div>
    </div>
    """
    soup = BeautifulSoup(html, "html.parser")
    # We will need to expose or test the internal parsing logic
    # For now, let's assume we update get_warsaw_movies
    # Actually, it's better to refactor a small helper for parsing if possible.
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pytest scraper/tests/test_filmweb_unit.py`
Expected: FAIL (fields not present in output)

- [ ] **Step 3: Update `scraper/filmweb_scraper.py`**
Modify the loop in `get_warsaw_movies` to extract these fields.

```python
# Inside the try block where showtimes_soup is parsed:
alt_title_element = showtimes_soup.select_one(".preview__alternateTitle")
original_title = alt_title_element.text.strip() if alt_title_element else None

year_element = showtimes_soup.select_one(".preview__year")
year = int(year_element.text.strip()) if year_element and year_element.text.strip().isdigit() else None

movies.append({
    "title": title, 
    "original_title": original_title, 
    "year": year, 
    "cinemas": cinemas
})
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pytest scraper/tests/test_filmweb_unit.py`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add scraper/filmweb_scraper.py scraper/tests/test_filmweb_unit.py
git commit -m "feat: extract original title and year from filmweb showtimes"
```

### Task 3: Update Main Matching Logic

**Files:**
- Modify: `scraper/main.py`

- [ ] **Step 1: Update the TMDB search call in `main.py`**
Use `original_title` if available and pass `year`.

```python
# Replace:
# tmdb_movie = tmdb.search_movie(title)
# With:
fw_title = fw_movie.get("title")
fw_original_title = fw_movie.get("original_title")
fw_year = fw_movie.get("year")

# Try original title first
tmdb_movie = tmdb.search_movie(fw_original_title or fw_title, year=fw_year)

# Fallback to Polish title if original title search failed and they are different
if not tmdb_movie and fw_original_title and fw_original_title != fw_title:
    print(f"info: TMDB search for original title '{fw_original_title}' failed. Retrying with Polish title '{fw_title}'...")
    tmdb_movie = tmdb.search_movie(fw_title, year=fw_year)
```

- [ ] **Step 2: Commit**
```bash
git add scraper/main.py
git commit -m "feat: use original title and year for TMDB matching"
```

### Task 4: End-to-End Verification

- [ ] **Step 1: Run a dry run for a known movie**
Manually check if "Projekt Hail Mary" is correctly matched using the new logic. Since it's a future release, it might not be in the current repertuar, but we can check other movies.

- [ ] **Step 2: Run all tests**
Run: `pytest scraper/tests/`
Expected: PASS

- [ ] **Step 3: Commit final changes**
```bash
git commit -m "test: verify filmweb original title matching logic" --allow-empty
```
