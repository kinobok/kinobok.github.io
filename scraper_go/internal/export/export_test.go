package export

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestExportToJSON_ValidData(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "export-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	poster := "http://example.com/poster.jpg"
	movies := []MovieModel{
		{
			ID:      "m1",
			Title:   "Project Hail Mary",
			Poster:  &poster,
			BoxdURI: "https://boxd.it/pEeQ",
		},
	}
	cinemas := []CinemaModel{
		{
			ID:      "c1",
			Name:    "Kino Muranów",
			Address: "ul. Gen. Andersa 5, 00-147 Warszawa",
			Coords: &CoordsModel{
				Lat: 52.249,
				Lng: 20.999,
			},
		},
	}
	showtimes := map[string][]ShowtimeModel{
		"2026-05-07": {
			{
				MovieID:  "m1",
				CinemaID: "c1",
				Times:    []string{"18:00", "21:00"},
			},
		},
	}
	metadata := MetadataModel{
		LastScrape:     "2026-05-07T10:00:00Z",
		TotalMovies:    1,
		AvailableDates: []string{"2026-05-07"},
		Failures:       []FailureModel{},
	}

	outputFile := filepath.Join(tmpDir, "data.json")

	err = ToJSON(movies, cinemas, showtimes, metadata, outputFile)
	if err != nil {
		t.Fatalf("ToJSON failed: %v", err)
	}

	if _, err := os.Stat(outputFile); os.IsNotExist(err) {
		t.Fatalf("Output file does not exist: %s", outputFile)
	}

	data, err := os.ReadFile(outputFile)
	if err != nil {
		t.Fatalf("Failed to read output file: %v", err)
	}

	var parsed Schema
	if err := json.Unmarshal(data, &parsed); err != nil {
		t.Fatalf("Failed to unmarshal output: %v", err)
	}

	if len(parsed.Movies) != 1 || parsed.Movies[0].Title != "Project Hail Mary" || parsed.Movies[0].BoxdURI != "https://boxd.it/pEeQ" {
		t.Errorf("Unexpected movie in exported JSON: %+v", parsed.Movies)
	}

	if len(parsed.Cinemas) != 1 || parsed.Cinemas[0].Name != "Kino Muranów" || parsed.Cinemas[0].Address != "ul. Gen. Andersa 5, 00-147 Warszawa" {
		t.Errorf("Unexpected cinema in exported JSON: %+v", parsed.Cinemas)
	}

	if parsed.Metadata.TotalMovies != 1 {
		t.Errorf("Unexpected total_movies: %d", parsed.Metadata.TotalMovies)
	}
}

func TestExportToJSON_InvalidData(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "export-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// Missing required field 'BoxdURI'
	movies := []MovieModel{
		{
			ID:    "m1",
			Title: "Invalid Movie",
			// BoxdURI is empty
		},
	}
	cinemas := []CinemaModel{}
	showtimes := map[string][]ShowtimeModel{}
	metadata := MetadataModel{}

	outputFile := filepath.Join(tmpDir, "data_invalid.json")

	err = ToJSON(movies, cinemas, showtimes, metadata, outputFile)
	if err == nil {
		t.Fatal("Expected ToJSON to fail due to missing boxd_uri, but it succeeded")
	}
}

func TestUniqueStrings(t *testing.T) {
	input := []string{"18:00", "21:00", "18:00", "22:00", "21:00"}
	expected := []string{"18:00", "21:00", "22:00"}

	result := UniqueStrings(input)
	if len(result) != len(expected) {
		t.Fatalf("Expected length %d, got %d", len(expected), len(result))
	}

	for i, v := range result {
		if v != expected[i] {
			t.Errorf("At index %d: expected %q, got %q", i, expected[i], v)
		}
	}
}
