import httpx
from bs4 import BeautifulSoup
from typing import Dict, Optional
import random


class LetterboxdScraper:
    BASE_URL = "https://letterboxd.com/film"
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    ]

    def _get_headers(self) -> Dict[str, str]:
        return {"User-Agent": random.choice(self.USER_AGENTS)}

    def get_short_uri(self, slug: str) -> str:
        url = f"{self.BASE_URL}/{slug}/"
        response = httpx.get(url, headers=self._get_headers(), follow_redirects=True)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # The share link is usually in an input field with id 'share-url'
        # or can be found in the "Share" button data.
        # Actually, it's often in a meta tag or a specific link.
        # Let's check for the share input.
        share_input = soup.select_one("input.share-link")
        if share_input:
            return share_input.get("value")

        # Fallback: look for the share button
        share_button = soup.select_one("a.js-share")
        if share_button and share_button.get("data-share-url"):
            return share_button.get("data-share-url")

        # Another common location for short URL
        short_link = soup.select_one('link[rel="shortlink"]')
        if short_link:
            return short_link.get("href")

        # Letterboxd often uses an input field for the share URL
        url_input = soup.select_one('input[id^="url-field-film"]')
        if url_input:
            return url_input.get("value")

        raise ValueError(f"Could not find short URI for slug: {slug}")
