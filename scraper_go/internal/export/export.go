// Package export handles the JSON schema validation and export of scraper data.
package export

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// MovieModel represents a scraped movie with its metadata.
type MovieModel struct {
	ID      string  `json:"id"`
	Title   string  `json:"title"`
	Poster  *string `json:"poster"`
	BoxdURI string  `json:"boxd_uri"`
}

// CoordsModel represents coordinates of a cinema.
type CoordsModel struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// CinemaModel represents a scraped cinema with its address and coordinates.
type CinemaModel struct {
	ID      string       `json:"id"`
	Name    string       `json:"name"`
	Address string       `json:"address"`
	Coords  *CoordsModel `json:"coords"`
}

// ShowtimeModel represents showtimes of a specific movie in a cinema.
type ShowtimeModel struct {
	MovieID  string   `json:"movie_id"`
	CinemaID string   `json:"cinema_id"`
	Times    []string `json:"times"`
}

// FailureModel represents a scraping failure on a specific movie.
type FailureModel struct {
	Title   string  `json:"title"`
	Reason  string  `json:"reason"`
	Details *string `json:"details"`
}

// MetadataModel represents metadata of a scrape execution.
type MetadataModel struct {
	LastScrape     string         `json:"last_scrape"`
	TotalMovies    int            `json:"total_movies"`
	AvailableDates []string       `json:"available_dates"`
	Failures       []FailureModel `json:"failures"`
}

// Schema represents the complete exported JSON data structure.
type Schema struct {
	Movies    []MovieModel               `json:"movies"`
	Cinemas   []CinemaModel              `json:"cinemas"`
	Showtimes map[string][]ShowtimeModel `json:"showtimes"`
	Metadata  MetadataModel              `json:"metadata"`
}

// Validate validates the structure of the schema to ensure correctness.
func (s *Schema) Validate() error {
	for _, m := range s.Movies {
		if m.ID == "" {
			return fmt.Errorf("movie ID cannot be empty")
		}
		if m.Title == "" {
			return fmt.Errorf("movie title cannot be empty")
		}
		if m.BoxdURI == "" {
			return fmt.Errorf("movie boxd_uri cannot be empty")
		}
		if !strings.HasPrefix(m.BoxdURI, "https://boxd.it/") {
			return fmt.Errorf("movie boxd_uri must start with https://boxd.it/, got: %s", m.BoxdURI)
		}
	}

	for _, c := range s.Cinemas {
		if c.ID == "" {
			return fmt.Errorf("cinema ID cannot be empty")
		}
		if c.Name == "" {
			return fmt.Errorf("cinema name cannot be empty")
		}
		if c.Address == "" {
			return fmt.Errorf("cinema address cannot be empty")
		}
	}

	for date, list := range s.Showtimes {
		if date == "" {
			return fmt.Errorf("showtime date cannot be empty")
		}
		for _, st := range list {
			if st.MovieID == "" {
				return fmt.Errorf("showtime movie_id cannot be empty")
			}
			if st.CinemaID == "" {
				return fmt.Errorf("showtime cinema_id cannot be empty")
			}
			if len(st.Times) == 0 {
				return fmt.Errorf("showtime times list cannot be empty")
			}
		}
	}

	return nil
}

// ToJSON exports the movie and showtime data into a JSON file after validation.
func ToJSON(movies []MovieModel, cinemas []CinemaModel, showtimes map[string][]ShowtimeModel, metadata MetadataModel, outputFile string) error {
	schema := Schema{
		Movies:    movies,
		Cinemas:   cinemas,
		Showtimes: showtimes,
		Metadata:  metadata,
	}

	if err := schema.Validate(); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	// Create directory if it doesn't exist
	dir := filepath.Dir(outputFile)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	file, err := os.Create(outputFile)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	return encoder.Encode(schema)
}

// UniqueStrings removes duplicate strings from a slice, preserving order.
func UniqueStrings(slice []string) []string {
	keys := make(map[string]bool)
	var list []string
	for _, entry := range slice {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}
