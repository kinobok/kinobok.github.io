package export

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestExportSchema_Validate(t *testing.T) {
	// 1. Valid schema
	schema := ExportSchema{
		Movies: []MovieModel{
			{
				ID:      "m1",
				Title:   "Project Hail Mary",
				BoxdURI: "https://boxd.it/abc",
			},
		},
		Cinemas: []CinemaModel{
			{
				ID:      "c1",
				Name:    "Kinoteka Warszawa",
				Address: "Plac Defilad 1",
			},
		},
		Showtimes: map[string][]ShowtimeModel{
			"2026-07-02": {
				{
					MovieID:  "m1",
					CinemaID: "c1",
					Times:    []string{"14:30", "18:00"},
				},
			},
		},
		Metadata: MetadataModel{
			LastScrape:     "2026-07-02T12:00:00Z",
			TotalMovies:    1,
			AvailableDates: []string{"2026-07-02"},
		},
	}

	if err := schema.Validate(); err != nil {
		t.Fatalf("Validation failed for a valid schema: %v", err)
	}

	// 2. Invalid schema (missing BoxdURI prefix)
	schema.Movies[0].BoxdURI = "https://letterboxd.com/film/abc"
	if err := schema.Validate(); err == nil {
		t.Error("Expected validation error for invalid BoxdURI prefix, got nil")
	}

	// Reset
	schema.Movies[0].BoxdURI = "https://boxd.it/abc"

	// 3. Invalid schema (empty Movie ID)
	schema.Movies[0].ID = ""
	if err := schema.Validate(); err == nil {
		t.Error("Expected validation error for empty movie ID, got nil")
	}
}

func TestExportToJSON(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "export-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	movies := []MovieModel{
		{ID: "m1", Title: "Title 1", BoxdURI: "https://boxd.it/abc"},
	}
	cinemas := []CinemaModel{
		{ID: "c1", Name: "Cinema 1", Address: "Addr 1"},
	}
	showtimes := map[string][]ShowtimeModel{
		"2026-07-02": {{MovieID: "m1", CinemaID: "c1", Times: []string{"12:00"}}},
	}
	metadata := MetadataModel{
		LastScrape:     "2026-07-02T12:00:00Z",
		TotalMovies:    1,
		AvailableDates: []string{"2026-07-02"},
	}

	outputFile := filepath.Join(tmpDir, "data_go.json")

	err = ExportToJSON(movies, cinemas, showtimes, metadata, outputFile)
	if err != nil {
		t.Fatalf("ExportToJSON failed: %v", err)
	}

	// Read and verify the file content
	data, err := os.ReadFile(outputFile)
	if err != nil {
		t.Fatalf("Failed to read output file: %v", err)
	}

	var parsed ExportSchema
	if err := json.Unmarshal(data, &parsed); err != nil {
		t.Fatalf("Failed to unmarshal output: %v", err)
	}

	if len(parsed.Movies) != 1 || parsed.Movies[0].Title != "Title 1" {
		t.Errorf("Unexpected movie in exported JSON: %+v", parsed.Movies)
	}
}
