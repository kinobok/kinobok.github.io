package export

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type MovieModel struct {
	ID      string  `json:"id"`
	Title   string  `json:"title"`
	Poster  *string `json:"poster"`
	BoxdURI string  `json:"boxd_uri"`
}

type CoordsModel struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type CinemaModel struct {
	ID      string       `json:"id"`
	Name    string       `json:"name"`
	Address string       `json:"address"`
	Coords  *CoordsModel `json:"coords"`
}

type ShowtimeModel struct {
	MovieID  string   `json:"movie_id"`
	CinemaID string   `json:"cinema_id"`
	Times    []string `json:"times"`
}

type FailureModel struct {
	Title   string  `json:"title"`
	Reason  string  `json:"reason"`
	Details *string `json:"details"`
}

type MetadataModel struct {
	LastScrape     string         `json:"last_scrape"`
	TotalMovies    int            `json:"total_movies"`
	AvailableDates []string       `json:"available_dates"`
	Failures       []FailureModel `json:"failures"`
}

type ExportSchema struct {
	Movies    []MovieModel               `json:"movies"`
	Cinemas   []CinemaModel              `json:"cinemas"`
	Showtimes map[string][]ShowtimeModel `json:"showtimes"`
	Metadata  MetadataModel              `json:"metadata"`
}

func (s *ExportSchema) Validate() error {
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

func ExportToJSON(movies []MovieModel, cinemas []CinemaModel, showtimes map[string][]ShowtimeModel, metadata MetadataModel, outputFile string) error {
	schema := ExportSchema{
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
