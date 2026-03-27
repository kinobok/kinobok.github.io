# kinꚘbok Design Specification v2

**Date:** 2026-03-22
**Topic:** kinꚘbok - Personal Cinema Recommendation Engine for Poland (Warsaw PoC)
**Status:** In Review

## 1. Overview
kinꚘbok is a privacy-first web application that helps Polish cinema-goers discover movies currently playing in their local theaters based on their Letterboxd Watchlist. It uses a "Cinema-First" approach, prioritizing a map-based discovery experience in Warsaw.
- **Repository:** https://github.com/mfrszpiotro/kinobok
- **PoC Goal:** Successfully match movies from a user's uploaded `watchlist.csv` with real-time showtimes in Warsaw using Letterboxd URIs as the primary key.

## 2. Core Features
- **Daily Scraper:** Automatically fetches showtimes and cinema metadata for Warsaw.
- **TMDB Bridge:** Matches Polish movie titles from Filmweb against the TMDB database to retrieve English titles and TMDB IDs.
- **Letterboxd URI Integration:** Resolves TMDB data to Letterboxd film pages and extracts the shortened `https://boxd.it/` URI for each movie.
- **Privacy-First Matching:** Processes user-uploaded `watchlist.csv` entirely in the browser using the `https://boxd.it/` URI column.
- **Warsaw Map Dashboard:** A Leaflet-based map highlighting cinemas with Watchlist matches.

## 3. Backend & Data Flow (The Warsaw Flow)
The backend scraper (Python) runs daily at 4:00 AM via GitHub Actions:
1.  **Filmweb Scrape:** Targets `filmweb.pl/showtimes/Warszawa` to identify active movies and cinemas.
2.  **Movie Detail Scrape:** For each movie, navigates to `filmweb.pl/film/[slug]/showtimes/Warszawa` to extract precise cinema mappings and times.
3.  **TMDB Enrichment:** Uses TMDB API to bridge Polish titles (Filmweb) to English titles (Letterboxd).
4.  **Letterboxd Resolution:**
    - **Slug Generation:** Transforms the TMDB English title into a hyphenated slug (e.g., "Project Hail Mary" → `project-hail-mary`). If the title is ambiguous, the scraper appends the production year (e.g., `project-hail-mary-2026`).
    - **Verification:** Navigates to `letterboxd.com/film/[slug]/` and verifies the movie's identity using TMDB metadata (Year/Director) to ensure the slug is correct.
    - **URI Extraction:** Scrapes the **Shortened URI** (`https://boxd.it/...`) from the "Share" button on the verified page.
5.  **Output:** Generates a static `public/data.json` containing:
    - `movies`: List of movies with titles, posters, and their unique `boxd.it` URIs.
    - `cinemas`: List of Warsaw cinemas with names, addresses, and geo-coordinates.
    - `showtimes`: Relational mapping of movies to cinemas and times.

## 4. Frontend & Matching logic
- **Framework:** Next.js (App Router) + TypeScript + Vanilla CSS.
- **CSV Parsing:** Uses `papaparse` to extract the `Letterboxd URI` column from the user's `watchlist.csv`.
- **Client-Side Matching:**
    - Performs a direct string match between the CSV's URIs and the URIs in `data.json`.
    - Matches are stored in the browser's state for immediate map and sidebar updates.
- **Privacy:** No user data (CSVs or matched lists) is ever transmitted to a server.

## 5. UI/UX Design
- **Interactive Map:** Leaflet markers for Warsaw cinemas. Matching cinemas are highlighted with high-signal colors.
- **Match Sidebar:**
    - CSV Upload dropzone.
    - Filterable list of matching movies currently playing today.
    - Clickable cinema markers to see specific showtimes for matched movies.
- **Scope Restriction:** UI is hardcoded to Warsaw for the PoC.

## 6. Constraints
- **Rate-Limiting:** Scraper must implement delays and rotate user-agents for Filmweb and Letterboxd.
- **Data Integrity:** TMDB matching must use Year + Director where possible to ensure the correct movie is linked to the Letterboxd URI.
- **Serverless for User Data:** The matching engine must remain 100% client-side.

## 7. Technical Stack
- **Scraper:** Python 3.11+, `BeautifulSoup4`, `httpx`, `RapidFuzz`.
- **Frontend:** Next.js, TypeScript, Leaflet.js, `papaparse`.
- **Deployment:** GitHub Pages or Vercel (Static Export).
