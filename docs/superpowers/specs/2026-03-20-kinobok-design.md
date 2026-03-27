# kinꚘbok Design Specification

**Date:** 2026-03-20
**Topic:** kinꚘbok - Personal Cinema Recommendation Engine for Poland
**Status:** Approved

## 1. Overview
kinꚘbok is a privacy-first web application that helps Polish cinema-goers discover movies currently playing in their local theaters based on their Letterboxd taste (Watchlist and Ratings). It uses a "Cinema-First" approach, prioritizing a map-based discovery experience.
- **Temporary Repository:** https://github.com/mfrszpiotro/kinꚘbok
- **Future:** Code may be moved to a dedicated project account upon completion for GitHub Pages or Vercel deployment.

## 2. Core Features
- **Daily Scraper:** Automatically fetches showtimes, cinema metadata (names, addresses, and geo-coordinates), and movie details from Filmweb for major Polish cities.
- **TMDB Integration:** Matches scraped Polish movie titles against the TMDB database to fetch global metadata (English titles, posters, directors, years).
- **Letterboxd scraper** Matches TMDB database data against Letterboxd film pages (English titles, ensured later by directors and years), fetches https://boxd.it/ shortened url (later to match against Letterboxd exported CSV provided by user).
- **Privacy-First Matching:** Processes user-uploaded Letterboxd CSVs (`watchlist.csv`) entirely in the browser. No personal data is sent to a server.
- **Smart Map Highlighting:** A Leaflet-based map that highlights cinemas based on movies from the user's Watchlist.
- **City & Time Filtering:** View showtimes for today, tomorrow, or the upcoming week for any supported Polish city (for PoC only in Warsaw).

## 3. Architecture & Data Flow
1.  **Backend (Python Scraper - GitHub Action):**
    - Runs daily at 4:00 AM.
    - Scrapes Filmweb for cities, cinemas, and movie showtimes.
    - Extracts cinema coordinates (lat/lng) from page metadata.
    - Performs fuzzy matching with TMDB API (Title + Year + Director).
    - Using TMDB API matching, looks up letterboxd page for a given title, verifies it's a correct movie by TMDB API data, and scrapes https://boxd.it/ shortened link from "Share this page" button.
    - the https://boxd.it/ link will be later used to match it against `watchlist.csv` data (see: docs/samples directory)
    - **Output:** A static `public/data.json` containing relational data for cinemas, movies, and showtimes.
2.  **Frontend (Next.js - SSG):**
    - Loads the daily `data.json`.
    - Handles Letterboxd CSV uploads using `papaparse`.
    - **Recommendation Engine (In-Browser):**
        - Cross-references `watchlist.csv` (by the https://boxd.it/ link)
3.  **Deployment:**
    - GitHub Action commits `data.json` and triggers a static export.
    - **Platform:** Target is GitHub Pages (if moved to a dedicated account) or Vercel.

## 4. Technical Stack
- **Scraper:** Python 3.11+, `BeautifulSoup4`, `httpx`, `RapidFuzz`.
- **Frontend Framework:** Next.js (App Router) + TypeScript.
- **Styling:** Vanilla CSS.
- **Maps:** Leaflet.js (`react-leaflet`).
- **Data Parsing:** `papaparse` (CSV), `Pydantic` (Python Data Validation).
- **Icons:** Lucide React.

## 5. UI/UX Design
- **Map Dashboard:** Central interactive map with high-signal markers.
- **Interactive Sidebar:** 
    - CSV Upload zone.
    - Cinema list sorted by relevance (matches/recs).
    - Movie details with "Watchlist" or "Match" tags.
- **Timeline:** Horizontal date picker for "Today", "Tomorrow", and the next 7 days.

## 6. Constraints & Security
- **Invasive Scraping:** Scraper must implement rate-limiting and rotate user-agents to avoid being invasive to Filmweb or to Letterboxd.
- **Privacy:** All user data (CSVs) stays in the browser's memory or `localStorage`.
- **Offline Capability:** Once `data.json` is loaded, the app works entirely client-side.
