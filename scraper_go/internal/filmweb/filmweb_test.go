package filmweb

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestFilmwebScraper_Scrape(t *testing.T) {
	// Setup a mock HTTP server to simulate Filmweb
	mux := http.NewServeMux()

	// 1. Mock the city showtimes page
	mux.HandleFunc("/showtimes/Warszawa", func(w http.ResponseWriter, r *http.Request) {
		// Respect optional day query param
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
	mux.HandleFunc("/film/Projekt+Hail+Mary-2026-10047841/showtimes/Warszawa", func(w http.ResponseWriter, r *http.Request) {
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

	mux.HandleFunc("/film/Another-Movie/showtimes/Warszawa", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<body>
				<div class="preview__year">abc</div> <!-- non-integer year -->
				<div class="seanceTiles">
					<div class="seanceTiles__title">Kinoteka</div>
					<!-- missing address and coords -->
					<div class="seanceTile__value">20:00</div>
				</div>
			</body>
			</html>
		`)
	})

	mux.HandleFunc("/film/Movie-Day-1/showtimes/Warszawa", func(w http.ResponseWriter, r *http.Request) {
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

	scraper := &FilmwebScraper{
		BaseURL: server.URL,
	}

	// Run with dayOffset = 0
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

	// Verify details for "Projekt Hail Mary"
	var m1 *FilmwebMovie
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

	if len(m1.Cinemas) != 1 {
		t.Fatalf("Expected 1 cinema for m1, got %d", len(m1.Cinemas))
	}

	c1, ok := m1.Cinemas["Cinema City Sadyba"]
	if !ok {
		t.Fatal("Cinema 'Cinema City Sadyba' not found")
	}

	if c1.Address != "Powsińska 31" {
		t.Errorf("Expected address 'Powsińska 31', got '%s'", c1.Address)
	}

	if c1.Coords == nil || c1.Coords.Lat != "52.2297" || c1.Coords.Lng != "21.0122" {
		t.Errorf("Expected coords lat=52.2297, lng=21.0122, got %+v", c1.Coords)
	}

	if len(c1.Times) != 2 || c1.Times[0] != "14:15" || c1.Times[1] != "17:30" {
		t.Errorf("Unexpected times: %v", c1.Times)
	}

	// Verify details for "Another Movie"
	var m2 *FilmwebMovie
	for _, m := range result.Movies {
		if m.Title == "Another Movie" {
			m2 = m
		}
	}

	if m2 == nil {
		t.Fatal("Movie 'Another Movie' not found")
	}

	if m2.OriginalTitle != "" {
		t.Errorf("Expected empty OriginalTitle, got '%s'", m2.OriginalTitle)
	}

	if m2.Year != 0 {
		t.Errorf("Expected Year 0 (fallback for invalid/missing), got %d", m2.Year)
	}

	if len(m2.Cinemas) != 1 {
		t.Fatalf("Expected 1 cinema for m2, got %d", len(m2.Cinemas))
	}

	c2, ok := m2.Cinemas["Kinoteka"]
	if !ok {
		t.Fatal("Cinema 'Kinoteka' not found")
	}

	if c2.Address != "Warszawa, Poland" {
		t.Errorf("Expected default address 'Warszawa, Poland', got '%s'", c2.Address)
	}

	if c2.Coords != nil {
		t.Errorf("Expected coords to be nil, got %+v", c2.Coords)
	}

	// Run with dayOffset = 1
	result1, err := scraper.Scrape("Warszawa", 1, 0)
	if err != nil {
		t.Fatalf("Scrape failed: %v", err)
	}

	expectedDate1 := time.Now().AddDate(0, 0, 1).Format("2006-01-02")
	if result1.Date != expectedDate1 {
		t.Errorf("Expected date %s, got %s", expectedDate1, result1.Date)
	}

	if len(result1.Movies) != 1 || result1.Movies[0].Title != "Movie Day 1" {
		t.Fatalf("Expected 'Movie Day 1', got %+v", result1.Movies)
	}
}
