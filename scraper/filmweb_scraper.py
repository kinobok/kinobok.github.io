import httpx
from bs4 import BeautifulSoup
from typing import List, Dict
import time
import random

class FilmwebScraper:
    BASE_URL = "https://www.filmweb.pl/showtimes/Warszawa"
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    ]

    def _get_headers(self) -> Dict[str, str]:
        return {"User-Agent": random.choice(self.USER_AGENTS)}

    def get_warsaw_movies(self, limit: int = None) -> List[Dict]:
        response = httpx.get(self.BASE_URL, headers=self._get_headers(), follow_redirects=True)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        movies = []
        movie_links = soup.select('.preview__title a')
        if limit:
            movie_links = movie_links[:limit]
            
        for movie_element in movie_links:
            title = movie_element.text.strip()
            movie_url = movie_element['href']
            
            # Navigate to individual movie showtime page
            showtimes_url = f"https://www.filmweb.pl{movie_url}/showtimes/Warszawa"
            
            # Respectful scraping: delay between requests
            time.sleep(random.uniform(1.0, 3.0))
            
            try:
                showtimes_response = httpx.get(showtimes_url, headers=self._get_headers(), follow_redirects=True)
                showtimes_response.raise_for_status()
                showtimes_soup = BeautifulSoup(showtimes_response.text, 'html.parser')
                
                cinemas = {}
                for cinema_section in showtimes_soup.select('.seanceTiles'):
                    name_element = cinema_section.select_one('.seanceTiles__title')
                    if not name_element:
                        continue
                    cinema_name = name_element.text.strip()
                    
                    # Extract address
                    address_element = cinema_section.select_one('.seanceTiles__address')
                    cinema_address = address_element.text.strip() if address_element else "Warsaw, Poland"

                    # Extract lat/lng from data attributes
                    lat = cinema_section.get('data-cinema-latitude')
                    lng = cinema_section.get('data-cinema-longitude')
                    
                    times = [time.text.strip() for time in cinema_section.select('.seanceTile__value')]
                    
                    if times:
                        cinemas[cinema_name] = {
                            "address": cinema_address,
                            "times": times,
                            "coords": {"lat": lat, "lng": lng} if lat and lng else None
                        }
                    
                movies.append({
                    "title": title,
                    "cinemas": cinemas
                })
            except Exception as e:
                print(f"Error scraping showtimes for {title}: {e}")
                continue
            
        return movies
