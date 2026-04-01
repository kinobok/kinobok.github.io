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
        Returns the first match with English title, ID, and year.
        """
        url = f"{self.BASE_URL}/search/movie"
        params = {
            "api_key": self.api_key,
            "query": title,
            "language": "en-US",
            "page": 1,
        }
        if year:
            params["year"] = year

        response = httpx.get(url, params=params)
        response.raise_for_status()

        data = response.json()
        results = data.get("results", [])

        if not results:
            return None

        movie = results[0]
        release_date = movie.get("release_date", "")
        year_from_date = int(release_date.split("-")[0]) if release_date else None

        return {
            "id": movie["id"],
            "title": movie["title"],
            "original_title": movie["original_title"],
            "year": year_from_date,
            "poster_path": movie.get("poster_path"),
        }
