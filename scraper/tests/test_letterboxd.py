from scraper.letterboxd_scraper import LetterboxdScraper
import pytest

def test_extract_boxd_uri():
    scraper = LetterboxdScraper()
    # Using a known movie slug on Letterboxd
    uri = scraper.get_short_uri("project-hail-mary")
    assert uri.startswith("https://boxd.it/")
