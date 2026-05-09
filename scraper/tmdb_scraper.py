import httpx
from typing import Dict, Optional, List
import os


class TMDBScraper:
    BASE_URL = "https://api.themoviedb.org/3"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("TMDB_API_KEY")
        if not self.api_key:
            raise ValueError(
                "TMDB_API_KEY must be provided or set as environment variable"
            )

    def search_movie(self, title: str, year: Optional[int] = None) -> Optional[Dict]:
        """
        Search for a movie by title and optional year.
        If year is provided and no match is found, retries with year-1 and year+1.
        Returns the first match with English title, ID, and year.
        """
        years_to_try = [year] if year else [None]
        if year:
            years_to_try.extend([year - 1, year + 1])

        for current_year in years_to_try:
            url = f"{self.BASE_URL}/search/movie"
            params = {
                "api_key": self.api_key,
                "query": title,
                "language": "en-US",
                "page": 1,
            }
            if current_year:
                params["year"] = current_year

            response = httpx.get(url, params=params)
            response.raise_for_status()

            data = response.json()
            results = data.get("results", [])

            if results:
                movie = results[0]
                release_date = movie.get("release_date", "")
                year_from_date = (
                    int(release_date.split("-")[0]) if release_date else None
                )

                return {
                    "id": movie["id"],
                    "title": movie["title"],
                    "original_title": movie["original_title"],
                    "year": year_from_date,
                    "poster_path": movie.get("poster_path"),
                }

        return None
