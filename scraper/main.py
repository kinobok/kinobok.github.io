import os
import time
import random
import datetime
import json
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

    output_path = os.path.join(os.getcwd(), "frontend/public/data.json")

    # Load existing data to support sliding window and ID consistency
    existing_data = {"movies": [], "cinemas": [], "showtimes": {}}
    if os.path.exists(output_path):
        try:
            with open(output_path, "r") as f:
                existing_data = json.load(f)
        except Exception as e:
            print(f"⚠️ Could not load existing data: {e}. Starting fresh.")

    today = datetime.date.today()
    is_refresh_day = today.weekday() == 2  # Wednesday

    if is_refresh_day or not existing_data.get("showtimes"):
        print("📅 Full refresh day (Wednesday or first run). Scraping 7 days...")
        days_to_scrape = range(7)
        final_showtimes = {}
    else:
        print("📅 Incremental update day. Scraping day offset 6...")
        days_to_scrape = [6]
        # Keep current and future days
        final_showtimes = {
            d: s
            for d, s in existing_data.get("showtimes", {}).items()
            if d >= today.isoformat()
        }

    movies_data = {m["boxd_uri"]: m for m in existing_data.get("movies", [])}
    cinemas_data = {c["name"]: c for c in existing_data.get("cinemas", [])}

    # Movie and cinema ID counters
    def get_max_id(items, prefix):
        ids = [int(i["id"][len(prefix) :]) for i in items if i["id"].startswith(prefix)]
        return max(ids) if ids else 0

    movie_id_counter = get_max_id(movies_data.values(), "m") + 1
    cinema_id_counter = get_max_id(cinemas_data.values(), "c") + 1

    for day_offset in days_to_scrape:
        print(f"📡 Scraping day offset {day_offset}...")
        result = filmweb.get_warsaw_movies(day_offset=day_offset)
        page_date = result["date"]
        scraped_movies = result["movies"]

        if not page_date:
            print(f"⚠️ No date found for offset {day_offset}. Skipping.")
            continue

        print(f"✅ Found {len(scraped_movies)} movies for {page_date}.")
        day_showtimes = []

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

                if boxd_uri not in movies_data:
                    movie_id = f"m{movie_id_counter}"
                    movie_id_counter += 1
                    movies_data[boxd_uri] = {
                        "id": movie_id,
                        "title": en_title,
                        "poster": (
                            f"https://image.tmdb.org/t/p/w500{tmdb_movie['poster_path']}"
                            if tmdb_movie.get("poster_path")
                            else None
                        ),
                        "boxd_uri": boxd_uri,
                    }

                mid = movies_data[boxd_uri]["id"]

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
                    day_showtimes.append(
                        {
                            "movie_id": mid,
                            "cinema_id": cid,
                            "times": cinema_info["times"],
                        }
                    )

                # Respectful scraping delay
                time.sleep(random.uniform(1.0, 2.0))

            except Exception as e:
                print(f"❌ Error processing '{title}': {e}")
                continue

        final_showtimes[page_date] = day_showtimes

    # 5. Export to JSON
    print(f"💾 Exporting data to {output_path}...")

    try:
        export_to_json(
            movies=list(movies_data.values()),
            cinemas=list(cinemas_data.values()),
            showtimes=final_showtimes,
            output_file=output_path,
        )
        print("✨ Scraping and export completed successfully!")
    except Exception as e:
        print(f"❌ Export failed: {e}")


if __name__ == "__main__":
    main()
