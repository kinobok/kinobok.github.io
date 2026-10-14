package tmdb

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestTMDBSearch(t *testing.T) {
	mux := http.NewServeMux()

	mux.HandleFunc("/search/movie", func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.URL.Query().Get("api_key")
		if apiKey != "test_key" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		query := r.URL.Query().Get("query")
		yearStr := r.URL.Query().Get("year")

		if query == "Projekt Hail Mary" && yearStr == "2026" {
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{
				"results": [
					{
						"id": 12345,
						"title": "Project Hail Mary",
						"original_title": "Project Hail Mary",
						"release_date": "2026-05-01"
					}
				]
			}`)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"results": []}`)
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	scraper := NewAPI("test_key")
	scraper.baseURL = server.URL

	result, err := scraper.SearchMovie("Projekt Hail Mary", 2026)
	if err != nil {
		t.Fatalf("SearchMovie failed: %v", err)
	}
	if result == nil {
		t.Fatal("Expected result to be found, got nil")
	}

	if result.ID != 12345 {
		t.Errorf("Expected ID 12345, got %d", result.ID)
	}
	if result.Title != "Project Hail Mary" {
		t.Errorf("Expected title 'Project Hail Mary', got %s", result.Title)
	}
	if result.Year != 2026 {
		t.Errorf("Expected year 2026, got %d", result.Year)
	}
}

func TestTMDBSearch_RetryYear(t *testing.T) {
	mux := http.NewServeMux()

	mux.HandleFunc("/search/movie", func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.URL.Query().Get("api_key")
		if apiKey != "test_key" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		query := r.URL.Query().Get("query")
		yearStr := r.URL.Query().Get("year")

		if query == "Old Movie" {
			if yearStr == "2025" {
				w.Header().Set("Content-Type", "application/json")
				fmt.Fprintf(w, `{
					"results": [
						{
							"id": 54321,
							"title": "Old Movie",
							"original_title": "Old Movie",
							"release_date": "2025-10-10"
						}
					]
				}`)
				return
			}
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"results": []}`)
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	scraper := NewAPI("test_key")
	scraper.baseURL = server.URL

	result, err := scraper.SearchMovie("Old Movie", 2026)
	if err != nil {
		t.Fatalf("SearchMovie failed: %v", err)
	}
	if result == nil {
		t.Fatal("Expected result to be found, got nil")
	}

	if result.ID != 54321 {
		t.Errorf("Expected ID 54321, got %d", result.ID)
	}
	if result.Year != 2025 {
		t.Errorf("Expected year 2025, got %d", result.Year)
	}
}

func TestNewTMDBApi_EnvFallback(t *testing.T) {
	os.Setenv("TMDB_API_KEY", "env-api-key")
	defer os.Unsetenv("TMDB_API_KEY")

	api := NewAPI("")
	if api.apiKey != "env-api-key" {
		t.Errorf("Expected apiKey 'env-api-key' from env, got '%s'", api.apiKey)
	}
}

func TestTMDBSearch_WithRatingAndRuntime(t *testing.T) {
	mux := http.NewServeMux()

	mux.HandleFunc("/search/movie", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{
			"results": [
				{
					"id": 9999,
					"title": "Dune: Part Two",
					"original_title": "Dune: Part Two",
					"release_date": "2024-03-01",
					"vote_average": 8.4,
					"vote_count": 1500
				}
			]
		}`)
	})

	mux.HandleFunc("/movie/9999", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{
			"id": 9999,
			"runtime": 166,
			"vote_average": 8.5,
			"vote_count": 1550
		}`)
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	scraper := NewAPI("test_key")
	scraper.baseURL = server.URL

	result, err := scraper.SearchMovie("Dune", 2024)
	if err != nil {
		t.Fatalf("SearchMovie failed: %v", err)
	}
	if result == nil {
		t.Fatal("Expected result to be found, got nil")
	}

	if result.VoteAverage != 8.5 {
		t.Errorf("Expected VoteAverage 8.5, got %f", result.VoteAverage)
	}
	if result.VoteCount != 1550 {
		t.Errorf("Expected VoteCount 1550, got %d", result.VoteCount)
	}
	if result.Runtime != 166 {
		t.Errorf("Expected Runtime 166, got %d", result.Runtime)
	}
	if result.URL != "https://www.themoviedb.org/movie/9999" {
		t.Errorf("Expected URL 'https://www.themoviedb.org/movie/9999', got %s", result.URL)
	}
}
