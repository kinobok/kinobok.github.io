<p align="center">
  <img src="frontend/public/kinobok_with_title.png" alt="kinooobok logo" width="140" />
</p>

<p align="center">
  <strong>A privacy-first movie matchmaker for Polish cinemas and Letterboxd watchlists.</strong>
</p>

---

## Overview

**kinobok** is a modern, privacy-focused web application designed to match your Letterboxd watchlist with movie showtimes in local cinemas across Poland (Warszawa, Kraków, Wrocław, Poznań, Gdańsk, Łódź, and more). The application processes all user data entirely client-side in the browser to maintain strict user privacy.

### Key Features
*   **Privacy-First Matching:** No user watchlists or personal data are ever uploaded to a backend server. File parsing and movie matching run 100% locally in your browser.
*   **Flexible Imports:** Easily import your Letterboxd watchlist by uploading either the exported `.zip` archive directly or a standalone `watchlist.csv`.
*   **Interactive Cinema Map:** Discover matching screenings visualised on a custom Leaflet map featuring real-time viewport synchronisation and geolocation ("Locate Me").
*   **Multi-City Support & Filters:** Browse showtimes grouped by city, collapse individual city sections, and selectively enable or disable venues—or entire cities—in the configuration menu.
*   **Smart Screening Filters:** Browse upcoming dates, hide or grey out past showtimes, and sort matches by rarity (screenings count across the week) or title.
*   **Automated Daily Updates:** A high-performance Go scraper runs daily via GitHub Actions to collect cinema schedules, resolve movie metadata via TMDB and Letterboxd, validate cinema coordinates, and publish fresh data.

---

## Architecture

*   **Frontend:** A static Next.js 14 (React 18 + TypeScript) single-page application hosted on GitHub Pages. Features custom client-side state management, archive extraction with `JSZip`, CSV parsing with `PapaParse`, and interactive mapping with `Leaflet` (`react-leaflet`) powered by CARTO basemaps.
*   **Backend Scraper (`scraper_go`):** A concurrent Go 1.25+ service using `Colly/v2` and `goquery` to scrape Polish cinema schedules from Filmweb (PL), match movie entries and Letterboxd identifiers using the TMDB API, determine true cinema cities via Haversine geographic validation, and export a structured dataset (`frontend/public/data_go.json`).

---

## Prerequisites

*   **Node.js** 20+
*   **Go** 1.25+ (or latest stable Go)
*   **TMDB API Key** (required to run the backend scraper)
*   **CARTO Basemaps API Key** (free at [carto.com/basemaps](https://carto.com/basemaps/apikey), required for frontend map tiles)

---

## Local Development

### 1. Frontend Web App

To run the frontend locally:

```bash
cd frontend

# Install dependencies
npm install

# Configure the CARTO basemaps key (free: https://carto.com/basemaps/apikey)
echo "NEXT_PUBLIC_CARTO_API_KEY=your_carto_key_here" > .env.local

# Start the Next.js development server
npm run dev

# Run the frontend unit & integration test suite (Vitest)
npm run test

# Check code style and formatting
npm run lint
npm run format
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

### 2. Backend Scraper

To run the showtime scraper locally:

```bash
cd scraper_go

# Download Go module dependencies
go mod download

# Configure your TMDB API Key
export TMDB_API_KEY=your_api_key_here

# Run the scraper pipeline (default: all supported Polish cities)
go run cmd/scraper/main.go

# Optional: Run for specific cities or limit movies per city for faster local runs
go run cmd/scraper/main.go -cities Warszawa -cities Kraków -limit-movies 5

# Run the backend test suite
go test ./...
```

---

## CI/CD & Deployment

This project uses **GitHub Actions** workflows for automated operations:
*   **Daily Showtime Scraper (`daily-scraper-go.yml`):** Runs daily at 4:30 AM UTC to scrape the latest cinema schedules across Poland, update `frontend/public/data_go.json`, and commit the updated data.
*   **Deploy to GitHub Pages (`deploy.yml`):** Automatically triggered on pushes to the `main` branch affecting frontend code or after a successful run of the daily scraper. Compiles and publishes the static Next.js export to GitHub Pages. Requires the `CARTO_API_KEY` repository variable for map tiles.
*   **Linter Checks (`revive.yml` and `prettier.yml`):** Enforce code formatting and quality standards across the Go backend and TypeScript frontend codebases.
