// Package tmdb provides movie search and metadata integration using The Movie Database (TMDB) API.
package tmdb

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
)

// Movie represents a movie entry retrieved from the TMDB API.
type Movie struct {
	ID            int    `json:"id"`
	Title         string `json:"title"`
	OriginalTitle string `json:"original_title"`
	Year          int    `json:"year"`
	PosterPath    string `json:"poster_path"`
}

// API provides methods to communicate with the TMDB API.
type API struct {
	apiKey  string
	baseURL string
}

// NewAPI creates a new API client with the given API key (falls back to TMDB_API_KEY environment variable if empty).
func NewAPI(apiKey string) *API {
	if apiKey == "" {
		apiKey = os.Getenv("TMDB_API_KEY")
	}
	return &API{
		apiKey:  apiKey,
		baseURL: "https://api.themoviedb.org/3",
	}
}

type tmdbSearchResponse struct {
	Results []struct {
		ID            int    `json:"id"`
		Title         string `json:"title"`
		OriginalTitle string `json:"original_title"`
		ReleaseDate   string `json:"release_date"`
		PosterPath    string `json:"poster_path"`
	} `json:"results"`
}

// SearchMovie searches for a movie on TMDB by its title and release year, using sequential retries on adjacent years if no direct match is found.
func (s *API) SearchMovie(title string, year int) (*Movie, error) {
	if s.apiKey == "" {
		s.apiKey = os.Getenv("TMDB_API_KEY")
		if s.apiKey == "" {
			return nil, fmt.Errorf("TMDB_API_KEY must be provided or set as environment variable")
		}
	}

	var yearsToTry []string
	if year > 0 {
		yearsToTry = append(yearsToTry, strconv.Itoa(year))
		yearsToTry = append(yearsToTry, strconv.Itoa(year-1))
		yearsToTry = append(yearsToTry, strconv.Itoa(year+1))
	} else {
		yearsToTry = append(yearsToTry, "")
	}

	for _, currentYear := range yearsToTry {
		reqURL, err := url.Parse(fmt.Sprintf("%s/search/movie", s.baseURL))
		if err != nil {
			return nil, err
		}

		query := reqURL.Query()
		query.Set("api_key", s.apiKey)
		query.Set("query", title)
		query.Set("language", "en-US")
		query.Set("page", "1")
		if currentYear != "" {
			query.Set("year", currentYear)
		}
		reqURL.RawQuery = query.Encode()

		resp, err := http.Get(reqURL.String())
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusUnauthorized {
			return nil, fmt.Errorf("unauthorized: invalid TMDB API Key")
		}
		if resp.StatusCode != http.StatusOK {
			continue
		}

		var searchResp tmdbSearchResponse
		if err := json.NewDecoder(resp.Body).Decode(&searchResp); err != nil {
			return nil, err
		}

		if len(searchResp.Results) > 0 {
			movie := searchResp.Results[0]
			releaseYear := 0
			if movie.ReleaseDate != "" {
				parts := strings.Split(movie.ReleaseDate, "-")
				if len(parts) > 0 {
					if y, err := strconv.Atoi(parts[0]); err == nil {
						releaseYear = y
					}
				}
			}

			return &Movie{
				ID:            movie.ID,
				Title:         movie.Title,
				OriginalTitle: movie.OriginalTitle,
				Year:          releaseYear,
				PosterPath:    movie.PosterPath,
			}, nil
		}
	}

	return nil, nil
}
