import pytest
from bs4 import BeautifulSoup
import os


# Helper to load mock HTML
def load_mock_html():
    path = os.path.join(os.path.dirname(__file__), "mock_showtimes.html")
    with open(path, "r") as f:
        return f.read()


def test_extract_movie_metadata_from_mock():
    html = load_mock_html()
    soup = BeautifulSoup(html, "html.parser")

    # Check for Polish title
    title_element = soup.select_one(".preview__title")
    title = title_element.text.strip() if title_element else None
    assert title == "Projekt Hail Mary"

    # Check for original title
    alt_title_element = soup.select_one(".preview__alternateTitle")
    original_title = alt_title_element.text.strip() if alt_title_element else None
    assert original_title == "Project Hail Mary"

    # Check for year
    year_element = soup.select_one(".preview__year")
    year_text = year_element.text.strip() if year_element else None
    year = int(year_text) if year_text and year_text.isdigit() else None
    assert year == 2026
