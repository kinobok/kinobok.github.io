from scraper.filmweb_scraper import FilmwebScraper

def test_scrape_warsaw_showtimes():
    scraper = FilmwebScraper()
    # Limit to 3 movies for faster and more reliable testing
    movies = scraper.get_warsaw_movies(limit=3)
    assert len(movies) > 0
    
    # Find a movie with showtimes to verify extraction
    matched_movie = next((m for m in movies if len(m['cinemas']) > 0), None)
    if not matched_movie:
        # If no movie in first 3 has showtimes, try one more without limit just to be sure
        movies = scraper.get_warsaw_movies(limit=10)
        matched_movie = next((m for m in movies if len(m['cinemas']) > 0), None)
        
    assert matched_movie is not None, "No movies with showtimes found"
    
    assert "title" in matched_movie
    assert "cinemas" in matched_movie
    
    # Verify cinema details
    cinema_name = list(matched_movie['cinemas'].keys())[0]
    cinema_data = matched_movie['cinemas'][cinema_name]
    assert "times" in cinema_data
    assert len(cinema_data['times']) > 0
    assert "coords" in cinema_data
    if cinema_data['coords']:
        assert "lat" in cinema_data['coords']
        assert "lng" in cinema_data['coords']
