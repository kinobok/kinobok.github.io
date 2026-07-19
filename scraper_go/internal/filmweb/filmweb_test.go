package filmweb

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestFilmwebScraper_Scrape(t *testing.T) {
	mux := http.NewServeMux()

	// 1. Mock the city showtimes page
	mux.HandleFunc("/showtimes/Warszawa", func(w http.ResponseWriter, r *http.Request) {
		day := r.URL.Query().Get("day")
		if day != "" && day != "0" {
			fmt.Fprintf(w, `
				<html>
				<body>
					<div class="preview__title"><a href="/film/Movie-Day-1">Movie Day 1</a></div>
				</body>
				</html>
			`)
			return
		}

		fmt.Fprintf(w, `
			<html>
			<body>
				<div class="preview__title"><a href="/film/Projekt+Hail+Mary-2026-10047841">Projekt Hail Mary</a></div>
				<div class="preview__title"><a href="/film/Another-Movie">Another Movie</a></div>
			</body>
			</html>
		`)
	})

	// 2. Mock individual movie showtimes pages
	mux.HandleFunc("/film/Projekt+Hail+Mary-2026-10047841/showtimes/Warszawa", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<body>
				<div class="preview__alternateTitle">Project Hail Mary</div>
				<div class="preview__year">2026</div>
				<div class="seanceTiles" data-cinema-latitude="52.2297" data-cinema-longitude="21.0122">
					<div class="seanceTiles__title">Cinema City Sadyba</div>
					<div class="seanceTiles__address">Powsińska 31</div>
					<div class="seanceTile__value">14:15</div>
					<div class="seanceTile__value">17:30</div>
				</div>
			</body>
			</html>
		`)
	})

	mux.HandleFunc("/film/Another-Movie/showtimes/Warszawa", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<body>
				<div class="preview__year">abc</div> <!-- non-integer year -->
				<div class="seanceTiles">
					<div class="seanceTiles__title">Kinoteka</div>
					<div class="seanceTile__value">20:00</div>
				</div>
			</body>
			</html>
		`)
	})

	mux.HandleFunc("/film/Movie-Day-1/showtimes/Warszawa", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<body>
				<div class="preview__year">2025</div>
				<div class="seanceTiles">
					<div class="seanceTiles__title">Multikino</div>
					<div class="seanceTile__value">19:00</div>
				</div>
			</body>
			</html>
		`)
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	scraper := &Scraper{
		BaseURL: server.URL,
	}

	result, err := scraper.Scrape("Warszawa", 0, 0)
	if err != nil {
		t.Fatalf("Scrape failed: %v", err)
	}

	expectedDate := time.Now().Format("2006-01-02")
	if result.Date != expectedDate {
		t.Errorf("Expected date %s, got %s", expectedDate, result.Date)
	}

	if len(result.Movies) != 2 {
		t.Fatalf("Expected 2 movies, got %d", len(result.Movies))
	}

	var m1 *Movie
	for _, m := range result.Movies {
		if m.Title == "Projekt Hail Mary" {
			m1 = m
		}
	}

	if m1 == nil {
		t.Fatal("Movie 'Projekt Hail Mary' not found")
	}

	if m1.OriginalTitle != "Project Hail Mary" {
		t.Errorf("Expected OriginalTitle 'Project Hail Mary', got '%s'", m1.OriginalTitle)
	}

	if m1.Year != 2026 {
		t.Errorf("Expected Year 2026, got %d", m1.Year)
	}
}

func TestFilmwebScraper_ExtractMovieMetadataFromMock(t *testing.T) {
	mux := http.NewServeMux()

	// Mocking city showtimes page with list
	mux.HandleFunc("/showtimes/Warszawa", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<body>
				<div class="preview__title"><a href="/film/Projekt+Hail+Mary-2026-10047841">Projekt Hail Mary</a></div>
			</body>
			</html>
		`)
	})

	// Mocking the movie page using the exact HTML structure from mock_showtimes.html
	mux.HandleFunc("/film/Projekt+Hail+Mary-2026-10047841/showtimes/Warszawa", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintf(w, `
			<div class="preview previewCard previewFilm PreviewFilm" itemprop="hasPart" itemscope itemtype="https://schema.org/Movie" data-film-id="10047841" data-entity-name="film">
				<div class="preview__card" data-badge-name="Film">
					<div class="preview__header">
						<h2 class="preview__title"><a class="preview__link" href="/film/Projekt+Hail+Mary-2026-10047841" itemprop="url" content="">Projekt Hail Mary</a></h2>
						<div class="preview__headerDetails">
							<div class="preview__alternateTitle">Project Hail Mary</div><wbr>
							<div class="preview__year" itemprop="datePublished" content="2026">2026</div>
							<div class="preview__duration" itemprop="duration" content=" PT2H36M">2h 36m</div>
						</div>
					</div>
				</div>
			</div>
		`)
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	scraper := &Scraper{
		BaseURL: server.URL,
	}

	result, err := scraper.Scrape("Warszawa", 0, 0)
	if err != nil {
		t.Fatalf("Scrape failed: %v", err)
	}

	if len(result.Movies) != 1 {
		t.Fatalf("Expected 1 movie parsed from mock, got %d", len(result.Movies))
	}

	m := result.Movies[0]
	if m.Title != "Projekt Hail Mary" {
		t.Errorf("Expected Title 'Projekt Hail Mary', got '%s'", m.Title)
	}

	if m.OriginalTitle != "Project Hail Mary" {
		t.Errorf("Expected OriginalTitle 'Project Hail Mary', got '%s'", m.OriginalTitle)
	}

	if m.Year != 2026 {
		t.Errorf("Expected Year 2026, got %d", m.Year)
	}
}

func TestFilmwebScraper_ScrapeWarsawShowtimes_Live(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping live Filmweb scraping test in short mode")
	}

	scraper := NewScraper()
	result, err := scraper.Scrape("Warszawa", 0, 3)
	if err != nil {
		t.Logf("Skipping live test: Filmweb is unreachable or returned error: %v", err)
		return
	}

	if result.Date == "" {
		t.Error("Expected scraped date to be populated")
	}

	if len(result.Movies) == 0 {
		t.Log("Warning: No movies found on the live Filmweb site for Warszawa today.")
		return
	}

	for _, m := range result.Movies {
		if m.Title == "" {
			t.Error("Expected movie title to be non-empty")
		}
		// Some movies might not have an original title or year, but they should at least be typed correctly
		if m.Year < 0 {
			t.Errorf("Expected year to be non-negative, got %d", m.Year)
		}
	}
}
