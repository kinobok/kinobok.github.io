package tmdb

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestTMDBApi_SearchMovie(t *testing.T) {
	mux := http.NewServeMux()

	// Mock search/movie endpoint
	mux.HandleFunc("/search/movie", func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.URL.Query().Get("api_key")
		if apiKey == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		query := r.URL.Query().Get("query")
		yearStr := r.URL.Query().Get("year")

		if query == "No Movie" {
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{"results": []}`)
			return
		}

		if query == "Projekt Hail Mary" {
			if yearStr == "2026" {
				w.Header().Set("Content-Type", "application/json")
				fmt.Fprintf(w, `{"results": [
					{
						"id": 12345,
						"title": "Project Hail Mary",
						"original_title": "Project Hail Mary",
						"release_date": "2026-05-20",
						"poster_path": "/path-to-poster.jpg"
					}
				]}`)
				return
			}
			// Fail for any other year
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{"results": []}`)
			return
		}

		if query == "The Flash" {
			// Simulating match only on year - 1 (e.g. searching for 2024, but matches on 2023)
			if yearStr == "2023" {
				w.Header().Set("Content-Type", "application/json")
				fmt.Fprintf(w, `{"results": [
					{
						"id": 9999,
						"title": "The Flash",
						"original_title": "The Flash",
						"release_date": "2023-06-16",
						"poster_path": "/flash.jpg"
					}
				]}`)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(w, `{"results": []}`)
			return
		}

		w.WriteHeader(http.StatusNotFound)
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	// Scenario 1: Successful match on first try
	api := NewTMDBApi("test-api-key")
	api.baseURL = server.URL

	movie, err := api.SearchMovie("Projekt Hail Mary", 2026)
	if err != nil {
		t.Fatalf("SearchMovie failed: %v", err)
	}
	if movie == nil {
		t.Fatal("Expected movie to be found, got nil")
	}
	if movie.ID != 12345 || movie.Title != "Project Hail Mary" || movie.Year != 2026 || movie.PosterPath != "/path-to-poster.jpg" {
		t.Errorf("Unexpected movie returned: %+v", movie)
	}

	// Scenario 2: Match on year - 1 (retry logic)
	// We search with year 2024, but it should fail for 2024, retry for 2023 (2024 - 1), and find "The Flash"
	movie2, err := api.SearchMovie("The Flash", 2024)
	if err != nil {
		t.Fatalf("SearchMovie failed: %v", err)
	}
	if movie2 == nil {
		t.Fatal("Expected movie to be found via year - 1 retry, got nil")
	}
	if movie2.ID != 9999 || movie2.Year != 2023 {
		t.Errorf("Expected movie ID 9999 and Year 2023, got: %+v", movie2)
	}

	// Scenario 3: No movie found
	movie3, err := api.SearchMovie("No Movie", 2026)
	if err != nil {
		t.Fatalf("SearchMovie failed: %v", err)
	}
	if movie3 != nil {
		t.Errorf("Expected nil movie, got: %+v", movie3)
	}

	// Scenario 4: Missing api key error
	os.Setenv("TMDB_API_KEY", "")
	apiNoKey := NewTMDBApi("")
	apiNoKey.baseURL = server.URL
	_, err = apiNoKey.SearchMovie("Projekt Hail Mary", 2026)
	if err == nil {
		t.Fatal("Expected error for missing API key, got nil")
	}
}

func TestNewTMDBApi_EnvFallback(t *testing.T) {
	os.Setenv("TMDB_API_KEY", "env-api-key")
	defer os.Unsetenv("TMDB_API_KEY")

	api := NewTMDBApi("")
	if api.apiKey != "env-api-key" {
		t.Errorf("Expected apiKey 'env-api-key' from env, got '%s'", api.apiKey)
	}
}
