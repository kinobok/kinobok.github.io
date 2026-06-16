<p align="center">
  <img src="frontend/public/kinobok.png" alt="kinooobok logo" width="120" />
</p>

$${\Huge{\textbf{\color{white}kin\color{#ff8000}o\color{green}o\color{blue}o\color{white}bok}}}$$ 

<p align="center">
  <strong>A privacy-first movie matchmaker for local Warsaw cinemas and Letterboxd watchlists.</strong>
</p>

---

## Current Project State - Warsaw Cinemas Only

Kinobok is a modern, privacy-focused web application designed to match your Letterboxd watchlist with movie showtimes in Warsaw cinemas. The application processes all user data (such as watchlists) entirely client-side in the browser to maintain strict user privacy.

### Key Features
*   **Privacy-First Matching:** No user watchlists or data are ever uploaded to a backend server. Processing of files is done fully in your browser.
*   **Flexible Imports:** Supports uploading either your raw Letterboxd `.zip` data export or a single `watchlist.csv`.
*   **Interactive Cinema Map:** View matching movie showtimes visualised on a beautiful custom Leaflet map of Warsaw.
*   **Local Cinema Filters:** Customise and filter search results by specific cinemas of interest.
*   **Daily Updates:** An automated scraping pipeline runs daily to compile Warsaw showtimes, resolve matching movie metadata via TMDB, and export the fresh dataset.

---

## Architecture

*   **Frontend:** A modern Next.js + React + TypeScript web application that uses custom state management, client-side ZIP parsing with `JSZip`, CSV parsing with `PapaParse`, and interactive maps with Leaflet.
*   **Backend Scraper:** A Python utility running BeautifulSoup4, HTTPX, and RapidFuzz to fetch local cinema schedules from Filmweb (PL), map film entries using the TMDB API, and format matching metadata into a client-readable JSON schema (`frontend/public/data.json`).

---

## Prerequisites

*   **Node.js** 18+ (Node 20+ recommended)
*   **Python** 3.11+
*   **TMDB API Key** (required to run the backend scraper)

---

## Local Development

### 1. Frontend Web App

To run the frontend locally:

```bash
cd frontend

# Install dependencies
npm install

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

To configure and run the daily showtime scraper locally:

```bash
# Set up a virtual environment (optional but recommended)
python -m venv env
source env/bin/activate

# Install scraper dependencies
pip install -r scraper/requirements.txt

# Configure your TMDB API Key
export TMDB_API_KEY=your_api_key_here

# Run the scraper pipeline
python scraper/main.py

# Run the backend test suite (pytest)
pytest
```

---

## CI/CD & Deployment

This project uses **GitHub Actions** workflows for automated operations:
*   **Daily Warsaw Scraper (`daily-scraper.yml`):** Runs every day at 4:00 AM UTC to fetch the latest cinema schedules, update `frontend/public/data.json`, and commit the updated data.
*   **Deploy to GitHub Pages (`deploy.yml`):** Triggered automatically on push to the `main` branch (for frontend files) or after a successful run of the daily scraper. It compiles and publishes the static Next.js export to GitHub Pages.
*   **Linter Checks (`black.yml` and `prettier.yml`):** Automatically format and check code quality for both the Python codebase and frontend TypeScript.
