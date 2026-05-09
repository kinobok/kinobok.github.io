# Spec: Filmweb Original Title Extraction for Improved TMDB Matching

**Date:** 2026-05-08
**Status:** Draft
**Topic:** Improving TMDB matching logic by using original titles and years extracted from Filmweb.

## 1. Purpose
The current scraper uses Polish titles from Filmweb to search for movies on TMDB. This often leads to mismatches or "no results" for international films whose Polish titles differ significantly from their English/original titles. Filmweb showtimes pages contain both the original title and the production year, which can be used to perform highly accurate TMDB lookups.

## 2. Success Criteria
- [ ] `FilmwebScraper` correctly extracts `original_title` and `year` from individual movie showtimes pages.
- [ ] `main.py` prioritizes `original_title` for TMDB searches.
- [ ] `main.py` passes the production `year` to TMDB search to filter results.
- [ ] Polish titles remain the primary fallback when an original title is not available.
- [ ] No additional network requests are introduced (metadata is pulled from existing page loads).

## 3. Architecture & Data Flow
### 3.1. Metadata Extraction (`filmweb_scraper.py`)
The `FilmwebScraper.get_warsaw_movies` method already visits each movie's showtimes page (e.g., `https://www.filmweb.pl/film/Projekt+Hail+Mary-2026-10047841/showtimes/Warszawa`).
We will update the parser to extract:
- `original_title`: From `.preview__alternateTitle` text.
- `year`: From `.preview__year` text (parsed as an integer).

### 3.2. Matching Logic (`main.py`)
In the main processing loop:
1. Receive `title`, `original_title`, and `year` from the scraper.
2. Call `tmdb.search_movie(title=original_title or title, year=year)`.
3. If no match is found with `original_title`, retry with `title` (if different).

## 4. Components
### 4.1. `FilmwebScraper` (Python)
- **Method**: `get_warsaw_movies`
- **Logic**: Use BeautifulSoup selectors to find the alternate title and year. Ensure robust handling of missing fields.

### 4.2. `TMDBScraper` (Python)
- **Method**: `search_movie`
- **Logic**: Ensure the `year` parameter is correctly passed to the TMDB API `/search/movie` endpoint (this is already implemented, but we will ensure it's utilized).

## 5. Error Handling
- **Parsing Failures**: If `preview__alternateTitle` or `preview__year` are missing, they should default to `None` without stopping the scraper.
- **TMDB Zero Matches**: If searching with `original_title` and `year` returns nothing, the system should log the failure and move to the next film, or optionally try a broader search without the year.

## 6. Testing Strategy
- **Mocked Responses**: Create a test case in `scraper/tests/test_filmweb.py` that uses a saved HTML snippet from a Filmweb showtimes page to verify extraction.
- **Matching Verification**: Use a manual test run (or integration test) to verify that "Projekt Hail Mary" is matched via its original title "Project Hail Mary" and year "2026".
