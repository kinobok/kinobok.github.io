import pytest
from scraper.tmdb_scraper import TMDBScraper
from unittest.mock import MagicMock, patch

@patch("httpx.get")
def test_tmdb_search(mock_get):
    # Mocking TMDB API response
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "results": [
            {
                "id": 12345,
                "title": "Project Hail Mary",
                "original_title": "Project Hail Mary",
                "release_date": "2026-05-01"
            }
        ]
    }
    mock_response.status_code = 200
    mock_get.return_value = mock_response
    
    scraper = TMDBScraper(api_key="test_key")
    result = scraper.search_movie("Projekt Hail Mary")
    
    assert result["id"] == 12345
    assert result["title"] == "Project Hail Mary"
    assert result["year"] == 2026
