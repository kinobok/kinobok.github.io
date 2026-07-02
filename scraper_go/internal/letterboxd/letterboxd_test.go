package letterboxd

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLetterboxdScraper_GetShortURI(t *testing.T) {
	mux := http.NewServeMux()

	// 1. Mock share-link input field
	mux.HandleFunc("/film/share-link/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<body>
				<input class="share-link" value="https://boxd.it/share-link-id" />
			</body>
			</html>
		`)
	})

	// 2. Mock js-share button fallback
	mux.HandleFunc("/film/js-share/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<body>
				<a class="js-share" data-share-url="https://boxd.it/js-share-id">Share</a>
			</body>
			</html>
		`)
	})

	// 3. Mock link[rel="shortlink"] fallback
	mux.HandleFunc("/film/shortlink/", func(w http.ResponseWriter, r *http.Request) {
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
	mux.HandleFunc("/film/url-field-film/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, `
			<html>
			<body>
				<input id="url-field-film-1234" value="https://boxd.it/url-field-id" />
			</body>
			</html>
		`)
	})

	// 5. Mock not found / failure
	mux.HandleFunc("/film/not-found/", func(w http.ResponseWriter, r *http.Request) {
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

	scraper := &LetterboxdScraper{
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
