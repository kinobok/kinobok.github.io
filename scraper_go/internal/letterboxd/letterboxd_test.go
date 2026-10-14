package letterboxd

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestLetterboxdScraper_GetShortURI(t *testing.T) {
	mux := http.NewServeMux()

	// 1. Mock share-link input field
	mux.HandleFunc("/film/share-link/", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<body>
				<input class="share-link" value="https://boxd.it/share-link-id" />
			</body>
			</html>
		`)
	})

	// 2. Mock js-share button fallback
	mux.HandleFunc("/film/js-share/", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<body>
				<a class="js-share" data-share-url="https://boxd.it/js-share-id">Share</a>
			</body>
			</html>
		`)
	})

	// 3. Mock link[rel="shortlink"] fallback
	mux.HandleFunc("/film/shortlink/", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<head>
				<link rel="shortlink" href="https://boxd.it/shortlink-id" />
			</head>
			<body></body>
			</html>
		`)
	})

	// 4. Mock input[id^="url-field-film"] fallback
	mux.HandleFunc("/film/url-field-film/", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<body>
				<input id="url-field-film-1234" value="https://boxd.it/url-field-id" />
			</body>
			</html>
		`)
	})

	// 5. Mock not found / failure
	mux.HandleFunc("/film/not-found/", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<body>
				<div>No sharing info here</div>
			</body>
			</html>
		`)
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	scraper := &Scraper{
		BaseURL: server.URL + "/film",
	}

	tests := []struct {
		slug     string
		expected string
		wantErr  bool
	}{
		{"share-link", "https://boxd.it/share-link-id", false},
		{"js-share", "https://boxd.it/js-share-id", false},
		{"shortlink", "https://boxd.it/shortlink-id", false},
		{"url-field-film", "https://boxd.it/url-field-id", false},
		{"not-found", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.slug, func(t *testing.T) {
			got, err := scraper.GetShortURI(tt.slug)
			if (err != nil) != tt.wantErr {
				t.Fatalf("GetShortURI() error = %v, wantErr %v", err, tt.wantErr)
			}
			if got != tt.expected {
				t.Errorf("GetShortURI() = %s, expected %s", got, tt.expected)
			}
		})
	}
}

func TestLetterboxdScraper_GetShortURI_Live(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping live integration test in short mode")
	}

	scraper := NewScraper()
	uri, err := scraper.GetShortURI("project-hail-mary")
	if err != nil {
		t.Logf("Skipping live test: Letterboxd is unreachable or returned error: %v", err)
		return
	}

	if !strings.HasPrefix(uri, "https://boxd.it/") {
		t.Errorf("Expected short URI to start with 'https://boxd.it/', got: %s", uri)
	}
}

func TestLetterboxdScraper_GetShortURI_TheLastDayOfSummer(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping live integration test in short mode")
	}

	scraper := NewScraper()
	uri, err := scraper.GetShortURI("the-last-day-of-summer-1958")
	if err != nil {
		t.Logf("Skipping live test: Letterboxd is unreachable or returned error: %v", err)
		return
	}

	if uri != "https://boxd.it/6I3u" {
		t.Errorf("Expected short URI 'https://boxd.it/6I3u', got: %s", uri)
	}
}

func TestLetterboxdScraper_GetShortURI_LynchOz_Live(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping live integration test in short mode")
	}

	scraper := NewScraper()
	uri, err := scraper.GetShortURI("lynch-oz")
	if err != nil {
		t.Logf("Skipping live test: Letterboxd is unreachable or returned error: %v", err)
		return
	}

	if uri != "https://boxd.it/ArIK" {
		t.Errorf("Expected short URI 'https://boxd.it/ArIK', got: %s", uri)
	}
}

func TestLetterboxdScraper_GetShortURI_BillieEilish(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping live integration test in short mode")
	}

	scraper := NewScraper()
	uri, err := scraper.GetShortURI("billie-eilish-hit-me-hard-and-soft-the-tour")
	if err != nil {
		t.Logf("Skipping live test: Letterboxd is unreachable or returned error: %v", err)
		return
	}

	if uri != "https://boxd.it/Wowg" {
		t.Errorf("Expected short URI 'https://boxd.it/Wowg', got: %s", uri)
	}
}

func TestLetterboxdScraper_GetShortURI_SlimeMovie(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping live integration test in short mode")
	}

	scraper := NewScraper()
	uri, err := scraper.GetShortURI("that-time-i-got-reincarnated-as-a-slime-the")
	if err != nil {
		t.Logf("Skipping live test: Letterboxd is unreachable or returned error: %v", err)
		return
	}

	if uri != "https://boxd.it/Qxf2" {
		t.Errorf("Expected short URI 'https://boxd.it/Qxf2', got: %s", uri)
	}
}

func TestLetterboxdScraper_GetShortURI_LifeBeyondPineCurtain(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping live integration test in short mode")
	}

	scraper := NewScraper()
	uri, err := scraper.GetShortURI("life-beyond-the-pine-curtain-america-the")
	if err != nil {
		t.Logf("Skipping live test: Letterboxd is unreachable or returned error: %v", err)
		return
	}

	if uri != "https://boxd.it/WzXs" {
		t.Errorf("Expected short URI 'https://boxd.it/WzXs', got: %s", uri)
	}
}
