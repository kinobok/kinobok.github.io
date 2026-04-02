import os
import time
import random
from typing import List, Dict
from filmweb_scraper import FilmwebScraper
from letterboxd_scraper import LetterboxdScraper
from tmdb_scraper import TMDBScraper
from slug_utils import generate_slug
from export import export_to_json


def main():
    print("🚀 Starting kinꚘbok Warsaw Daily Scraper...")

    # Initialize scrapers
    filmweb = FilmwebScraper()
    letterboxd = LetterboxdScraper()
    tmdb_api_key = os.environ.get("TMDB_API_KEY")
    if not tmdb_api_key:
        print("❌ Error: TMDB_API_KEY environment variable is not set.")
        return

    tmdb = TMDBScraper(tmdb_api_key)

    # 1. Scrape Warsaw movies and showtimes from Filmweb
    print("📡 Fetching Warsaw movies from Filmweb...")
    # For PoC, we might want to limit or just fetch everything.
    # Let's start with a reasonable limit if needed, or all if it's not too many.
    scraped_movies = filmweb.get_warsaw_movies()
    print(f"✅ Found {len(scraped_movies)} movies playing in Warsaw.")

    movies_data = []
    cinemas_data = {}
    showtimes_data = []

    movie_id_counter = 1
    cinema_id_counter = 1

    for fw_movie in scraped_movies:
        title = fw_movie["title"]
        print(f"🎬 Processing: {title}...")

        # 2. Match with TMDB to get English title and Year
        try:
            tmdb_movie = tmdb.search_movie(title)
            if not tmdb_movie:
                print(f"⚠️ Could not find '{title}' on TMDB. Skipping.")
                continue

            en_title = tmdb_movie["title"]
            year = tmdb_movie["year"]

            # 3. Generate slug and get Letterboxd URI
            slug = generate_slug(en_title, year)
            try:
                boxd_uri = letterboxd.get_short_uri(slug)
            except Exception as e:
                print(
                    f"⚠️ Could not resolve Letterboxd URI for '{en_title}' ({slug}): {e}"
                )
                continue

            movie_id = f"m{movie_id_counter}"
            movie_id_counter += 1

            movies_data.append(
                {
                    "id": movie_id,
                    "title": en_title,
                    "poster": (
                        f"https://image.tmdb.org/t/p/w500{tmdb_movie['poster_path']}"
                        if tmdb_movie.get("poster_path")
                        else None
                    ),
                    "boxd_uri": boxd_uri,
                }
            )

            # 4. Map cinemas and showtimes
            for cinema_name, cinema_info in fw_movie["cinemas"].items():
                if cinema_name not in cinemas_data:
                    cid = f"c{cinema_id_counter}"
                    cinema_id_counter += 1
                    cinemas_data[cinema_name] = {
                        "id": cid,
                        "name": cinema_name,
                        "address": cinema_info["address"],
                        "coords": cinema_info["coords"],
                    }

                cid = cinemas_data[cinema_name]["id"]
                showtimes_data.append(
                    {
                        "movie_id": movie_id,
                        "cinema_id": cid,
                        "times": cinema_info["times"],
                    }
                )

            # Respectful scraping delay
            time.sleep(random.uniform(1.0, 2.0))

        except Exception as e:
            print(f"❌ Error processing '{title}': {e}")
            continue

    # 5. Export to JSON
    # When run from scraper/, we need to go up one level to find frontend/
    # However, if run from project root, the path below is correct.
    # To be safe and portable, we can use an absolute path or relative to project root.
    # For now, let's keep it relative to the root assuming the user runs it from there.
    # If the user runs it from scraper/, they can adjust.
    output_path = os.path.join(os.getcwd(), "/frontend/public/data.json")
    print(f"💾 Exporting data to {output_path}...")

    try:
        export_to_json(
            movies=movies_data,
            cinemas=list(cinemas_data.values()),
            showtimes=showtimes_data,
            output_file=output_path,
        )
        print("✨ Scraping and export completed successfully!")
    except Exception as e:
        print(f"❌ Export failed: {e}")


if __name__ == "__main__":
    main()
