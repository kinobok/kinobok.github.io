# kinꚘbok Warsaw PoC

kinꚘbok is a privacy-first web application that matches your Letterboxd watchlist with Warsaw cinema showtimes. It processes your data entirely in the browser using the unique `boxd.it` URIs.

## Architecture
- **Backend:** Python scraper that bridges Filmweb (PL) to Letterboxd (EN) via TMDB, generating `frontend/public/data.json`.
- **Frontend:** Next.js application that performs client-side matching between the daily `data.json` and a user's uploaded `watchlist.csv`.

## Prerequisites
- Node.js 18+
- Python 3.11+
- TMDB API Key (for the scraper)

## Local Setup

### 1. Frontend
To run the web application locally:
```bash
cd frontend
npm install
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

### 2. Scraper
To update the showtimes data locally:
```bash
# Set up environment variables
export TMDB_API_KEY=your_api_key_here

# Install dependencies
pip install -r requirements.txt

# Run the daily orchestration script
python scraper/main.py
```
This will refresh the `frontend/public/data.json` file with the latest showtimes from Warsaw.

## Deployment
The project is configured with a GitHub Action (`.github/workflows/daily-scraper.yml`) that runs every day at 4:00 AM UTC to update the data.

## Usage
1. Export your Letterboxd watchlist as a CSV.
2. Upload the `watchlist.csv` to the kinꚘbok sidebar.
3. Matching cinemas in Warsaw will be highlighted on the map.
