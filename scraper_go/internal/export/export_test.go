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
			City:    "Warszawa",
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

	if len(parsed.Cinemas) != 1 || parsed.Cinemas[0].Name != "Kino Muranów" || parsed.Cinemas[0].Address != "ul. Gen. Andersa 5, 00-147 Warszawa" || parsed.Cinemas[0].City != "Warszawa" {
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

	// Missing cinema City
	validMovies := []MovieModel{
		{
			ID:      "m1",
			Title:   "Valid Movie",
			BoxdURI: "https://boxd.it/test",
		},
	}
	invalidCinemas := []CinemaModel{
		{
			ID:      "c1",
			Name:    "Cinema",
			Address: "Address",
			// City is empty
		},
	}
	err = ToJSON(validMovies, invalidCinemas, showtimes, metadata, outputFile)
	if err == nil {
		t.Fatal("Expected ToJSON to fail due to missing cinema city, but it succeeded")
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

func TestExportToJSON_WithMovieRatingsAndRuntime(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "export-ratings-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	rating := 8.4
	voteCount := 2500
	runtime := 166
	tmdbID := 693134
	tmdbURL := "https://www.themoviedb.org/movie/693134"
	year := 2024

	movies := []MovieModel{
		{
			ID:        "m1",
			Title:     "Dune: Part Two",
			BoxdURI:   "https://boxd.it/hZkK",
			Rating:    &rating,
			VoteCount: &voteCount,
			Runtime:   &runtime,
			TMDBID:    &tmdbID,
			TMDBURL:   &tmdbURL,
			Year:      &year,
		},
	}
	cinemas := []CinemaModel{
		{
			ID:      "c1",
			Name:    "Kino Nowe Horyzonty",
			City:    "Wrocław",
			Address: "ul. Kazimierza Wielkiego 19a-21",
		},
	}
	showtimes := map[string][]ShowtimeModel{
		"2026-05-07": {
			{
				MovieID:  "m1",
				CinemaID: "c1",
				Times:    []string{"19:00"},
			},
		},
	}
	metadata := MetadataModel{
		LastScrape:     "2026-05-07T10:00:00Z",
		TotalMovies:    1,
		AvailableDates: []string{"2026-05-07"},
	}

	outputFile := filepath.Join(tmpDir, "data.json")
	if err := ToJSON(movies, cinemas, showtimes, metadata, outputFile); err != nil {
		t.Fatalf("ToJSON failed: %v", err)
	}

	data, err := os.ReadFile(outputFile)
	if err != nil {
		t.Fatalf("Failed to read output: %v", err)
	}

	var parsed Schema
	if err := json.Unmarshal(data, &parsed); err != nil {
		t.Fatalf("Failed to unmarshal output: %v", err)
	}

	if len(parsed.Movies) != 1 {
		t.Fatalf("Expected 1 movie, got %d", len(parsed.Movies))
	}
	m := parsed.Movies[0]
	if m.Rating == nil || *m.Rating != 8.4 {
		t.Errorf("Expected rating 8.4, got %v", m.Rating)
	}
	if m.VoteCount == nil || *m.VoteCount != 2500 {
		t.Errorf("Expected vote_count 2500, got %v", m.VoteCount)
	}
	if m.Runtime == nil || *m.Runtime != 166 {
		t.Errorf("Expected runtime 166, got %v", m.Runtime)
	}
	if m.TMDBID == nil || *m.TMDBID != 693134 {
		t.Errorf("Expected tmdb_id 693134, got %v", m.TMDBID)
	}
	if m.TMDBURL == nil || *m.TMDBURL != "https://www.themoviedb.org/movie/693134" {
		t.Errorf("Expected tmdb_url 'https://www.themoviedb.org/movie/693134', got %v", m.TMDBURL)
	}
	if m.Year == nil || *m.Year != 2024 {
		t.Errorf("Expected year 2024, got %v", m.Year)
	}
}

func TestValidateCurrentDataGoJSON(t *testing.T) {
	dataPath := filepath.Join("..", "..", "..", "frontend", "public", "data_go.json")
	data, err := os.ReadFile(dataPath)
	if err != nil {
		t.Skipf("data_go.json not found at %s: %v", dataPath, err)
	}

	var schema Schema
	if err := json.Unmarshal(data, &schema); err != nil {
		t.Fatalf("Failed to parse data_go.json: %v", err)
	}

	if err := schema.Validate(); err != nil {
		t.Fatalf("data_go.json validation failed: %v", err)
	}
}
