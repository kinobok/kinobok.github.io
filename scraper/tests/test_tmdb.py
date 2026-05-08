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
                "release_date": "2026-05-01",
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


@patch("httpx.get")
def test_tmdb_search_retry_year(mock_get):
    # Mocking TMDB API responses: 
    # 1. First call (2026) -> No results
    # 2. Second call (2025) -> Result found
    mock_response_empty = MagicMock()
    mock_response_empty.json.return_value = {"results": []}
    mock_response_empty.status_code = 200
    
    mock_response_match = MagicMock()
    mock_response_match.json.return_value = {
        "results": [
            {
                "id": 54321,
                "title": "Old Movie",
                "original_title": "Old Movie",
                "release_date": "2025-10-10",
            }
        ]
    }
    mock_response_match.status_code = 200
    
    mock_get.side_effect = [mock_response_empty, mock_response_match]

    scraper = TMDBScraper(api_key="test_key")
    result = scraper.search_movie("Old Movie", year=2026)

    assert result["id"] == 54321
    assert result["year"] == 2025
    assert mock_get.call_count == 2
