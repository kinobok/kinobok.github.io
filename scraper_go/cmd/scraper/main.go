package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"cmd/scraper/main.go/internal/export"
	"cmd/scraper/main.go/internal/filmweb"
	"cmd/scraper/main.go/internal/letterboxd"
	"cmd/scraper/main.go/internal/slug"
	"cmd/scraper/main.go/internal/tmdb"
)

type stringSlice []string

func (s *stringSlice) String() string {
	return strings.Join(*s, ",")
}

func (s *stringSlice) Set(value string) error {
	*s = append(*s, value)
	return nil
}

type intSlice []int

func (i *intSlice) String() string {
	var s []string
	for _, v := range *i {
		s = append(s, strconv.Itoa(v))
	}
	return strings.Join(s, ",")
}

func (i *intSlice) Set(value string) error {
	val, err := strconv.Atoi(value)
	if err != nil {
		return err
	}
	*i = append(*i, val)
	return nil
}

func main() {
	var cities stringSlice
	var days intSlice
	limitMovies := flag.Int("limit-movies", 0, "Limit number of movies scraped per city")
	flag.Var(&cities, "cities", "Cities to scrape (can be specified multiple times)")
	flag.Var(&days, "days", "Days offset to scrape (can be specified multiple times)")
	flag.Parse()

	if len(cities) == 0 {
		cities = []string{
			"Warszawa", "Wrocław", "Poznań", "Kraków", "Gdańsk",
			"Szczecin", "Łódź", "Toruń", "Katowice", "Lublin",
			"Olsztyn", "Częstochowa", "Kalisz", "Białystok",
			"Kielce", "Zielona Góra", "Opole", "Rzeszów", "Radom",
			"Siedlce", "Skierniewice", "Płock", "Łomża", "Koszalin",
		}
	}

	log.Printf("🚀 Starting kinꚘbok Go Daily Scraper for %d cities...\n", len(cities))

	tmdbAPIKey := os.Getenv("TMDB_API_KEY")
	if tmdbAPIKey == "" {
		log.Fatal("❌ Error: TMDB_API_KEY environment variable is not set.")
	}

	filmwebScraper := filmweb.NewFilmwebScraper()
	letterboxdScraper := letterboxd.NewLetterboxdScraper()
	tmdbApi := tmdb.NewTMDBApi(tmdbAPIKey)

	outputPath := filepath.Join("..", "frontend", "public", "data_go.json")

	// Load existing data to support sliding window and ID consistency
	existingData := export.ExportSchema{
		Showtimes: make(map[string][]export.ShowtimeModel),
	}
	if _, err := os.Stat(outputPath); err == nil {
		data, err := os.ReadFile(outputPath)
		if err == nil {
			if err := json.Unmarshal(data, &existingData); err != nil {
				log.Printf("⚠️ Could not load existing data: %v. Starting fresh.\n", err)
			}
		}
	}

	today := time.Now().Format("2006-01-02")
	weekday := time.Now().Weekday()
	isRefreshDay := weekday == time.Wednesday || weekday == time.Thursday || weekday == time.Friday

	var daysToScrape []int
	var finalShowtimes = make(map[string][]export.ShowtimeModel)

	wereShowtimesPopulated := len(existingData.Showtimes) >= 7

	if len(days) > 0 {
		log.Printf("📅 Scraping user-specified days offsets: %v...\n", days)
		daysToScrape = days
	} else if isRefreshDay || !wereShowtimesPopulated {
		log.Println("📅 Full refresh day (Wednesday, Thursday, Friday or first run). Scraping 7 days...")
		for i := 0; i < 7; i++ {
			daysToScrape = append(daysToScrape, i)
		}
	} else {
		log.Println("📅 Incremental update day. Scraping day offset 6...")
		daysToScrape = []int{6}
		// Keep current and future days
		for dateStr, stList := range existingData.Showtimes {
			if dateStr >= today {
				finalShowtimes[dateStr] = stList
			}
		}
	}

	moviesMap := make(map[string]export.MovieModel)
	for _, m := range existingData.Movies {
		moviesMap[m.BoxdURI] = m
	}

	cinemasMap := make(map[string]export.CinemaModel)
	for _, c := range existingData.Cinemas {
		cinemasMap[c.Name] = c
	}

	// Helper to find starting ID counters
	getMaxID := func(items []string, prefix string) int {
		maxVal := 0
		for _, id := range items {
			if strings.HasPrefix(id, prefix) {
				if val, err := strconv.Atoi(id[len(prefix):]); err == nil && val > maxVal {
					maxVal = val
				}
			}
		}
		return maxVal
	}

	var movieIDs []string
	for _, m := range moviesMap {
		movieIDs = append(movieIDs, m.ID)
	}
	var cinemaIDs []string
	for _, c := range cinemasMap {
		cinemaIDs = append(cinemaIDs, c.ID)
	}

	movieIDCounter := getMaxID(movieIDs, "m") + 1
	cinemaIDCounter := getMaxID(cinemaIDs, "c") + 1

	var movieMutex sync.Mutex
	var cinemaMutex sync.Mutex
	var failures []export.FailureModel
	var failuresMutex sync.Mutex

	// Cache to avoid double fetching the same movie metadata during parallel runs
	type movieResolution struct {
		boxdURI string
		movie   export.MovieModel
		err     error
	}
	resolvedCache := make(map[string]*movieResolution)
	var cacheMutex sync.Mutex

	// We'll scrape days sequentially, but inside each day scrape we process cities concurrently,
	// and fetch TMDB/Letterboxd concurrently using a worker pool.
	for _, dayOffset := range daysToScrape {
		log.Printf("📡 Scraping day offset %d...\n", dayOffset)

		// 1. Scrape all cities concurrently for this day offset
		type cityResult struct {
			city   string
			result *filmweb.FilmwebResult
			err    error
		}
		cityChan := make(chan cityResult, len(cities))
		var wg sync.WaitGroup

		for _, city := range cities {
			wg.Add(1)
			go func(c string) {
				defer wg.Done()
				res, err := filmwebScraper.Scrape(c, dayOffset, *limitMovies)
				cityChan <- cityResult{city: c, result: res, err: err}
			}(city)
		}

		wg.Wait()
		close(cityChan)

		// Collect results from city scraping
		var pageDate string
		var rawMoviesByCity = make(map[string][]*filmweb.FilmwebMovie)
		for res := range cityChan {
			if res.err != nil {
				log.Printf("❌ Error scraping city %s for offset %d: %v\n", res.city, dayOffset, res.err)
				continue
			}
			if res.result != nil {
				if pageDate == "" {
					pageDate = res.result.Date
				}
				rawMoviesByCity[res.city] = res.result.Movies
				log.Printf("✅ Found %d movies for %s on %s.\n", len(res.result.Movies), res.city, res.result.Date)
			}
		}

		if pageDate == "" {
			log.Printf("⚠️ No date resolved for offset %d. Skipping.\n", dayOffset)
			continue
		}

		// 2. Resolve TMDB and Letterboxd concurrently for all movie showtimes in this day
		type resolveJob struct {
			city    string
			fwMovie *filmweb.FilmwebMovie
		}

		jobs := make(chan resolveJob, 200)
		var dayShowtimes []export.ShowtimeModel
		var showtimesMutex sync.Mutex

		workerWg := sync.WaitGroup{}
		numWorkers := 8

		for w := 0; w < numWorkers; w++ {
			workerWg.Add(1)
			go func() {
				defer workerWg.Done()
				for job := range jobs {
					fwMovie := job.fwMovie
					city := job.city
					title := fwMovie.Title

					// Generate cache key
					cacheKey := fmt.Sprintf("%s_%d", strings.ToLower(title), fwMovie.Year)

					// Check Cache first
					cacheMutex.Lock()
					cached, found := resolvedCache[cacheKey]
					if !found {
						// Add negative placeholder to prevent duplicate concurrent hits while fetching
						resolvedCache[cacheKey] = nil
						cacheMutex.Unlock()

						// Fetch metadata
						log.Printf("🎬 Fetching metadata for: %s (Year: %d)...", title, fwMovie.Year)

						var tmdbMovie *tmdb.TMDBMovie
						var err error

						// Try original title first
						searchTitle := fwMovie.OriginalTitle
						if searchTitle == "" {
							searchTitle = title
						}

						tmdbMovie, err = tmdbApi.SearchMovie(searchTitle, fwMovie.Year)
						if err != nil || tmdbMovie == nil {
							// Try with polish title if different
							if fwMovie.OriginalTitle != "" && fwMovie.OriginalTitle != title {
								tmdbMovie, err = tmdbApi.SearchMovie(title, fwMovie.Year)
							}
						}

						if err != nil || tmdbMovie == nil {
							failuresMutex.Lock()
							failures = append(failures, export.FailureModel{
								Title:  title,
								Reason: "TMDB search failed",
								Details: func() *string {
									s := fmt.Sprintf("No matches found for '%s' (year: %d)", title, fwMovie.Year)
									return &s
								}(),
							})
							failuresMutex.Unlock()

							cacheMutex.Lock()
							resolvedCache[cacheKey] = &movieResolution{err: fmt.Errorf("TMDB search failed")}
							cacheMutex.Unlock()
							continue
						}

						// Generate Letterboxd slug
						boxdSlug := slug.GenerateSlug(tmdbMovie.Title, tmdbMovie.Year)
						boxdURI, err := letterboxdScraper.GetShortURI(boxdSlug)
						if err != nil {
							failuresMutex.Lock()
							failures = append(failures, export.FailureModel{
								Title:  title,
								Reason: "Letterboxd URI resolution failed",
								Details: func() *string {
									s := fmt.Sprintf("Slug: %s, Error: %v", boxdSlug, err)
									return &s
								}(),
							})
							failuresMutex.Unlock()

							cacheMutex.Lock()
							resolvedCache[cacheKey] = &movieResolution{err: fmt.Errorf("Letterboxd short link failed: %w", err)}
							cacheMutex.Unlock()
							continue
						}

						movieMutex.Lock()
						movieModel, exists := moviesMap[boxdURI]
						if !exists {
							mid := fmt.Sprintf("m%d", movieIDCounter)
							movieIDCounter++
							movieModel = export.MovieModel{
								ID:      mid,
								Title:   tmdbMovie.Title,
								BoxdURI: boxdURI,
							}
							if tmdbMovie.PosterPath != "" {
								posterURL := fmt.Sprintf("https://image.tmdb.org/t/p/w500%s", tmdbMovie.PosterPath)
								movieModel.Poster = &posterURL
							}
							moviesMap[boxdURI] = movieModel
						}
						movieMutex.Unlock()

						cachedVal := &movieResolution{
							boxdURI: boxdURI,
							movie:   movieModel,
						}
						cacheMutex.Lock()
						resolvedCache[cacheKey] = cachedVal
						cacheMutex.Unlock()
						cached = cachedVal
					} else {
						cacheMutex.Unlock()
						// Wait if it was started concurrently but not finished yet
						for {
							cacheMutex.Lock()
							cached = resolvedCache[cacheKey]
							cacheMutex.Unlock()
							if cached != nil {
								break
							}
							time.Sleep(50 * time.Millisecond)
						}
					}

					if cached.err != nil {
						continue
					}

					mid := cached.movie.ID

					// Process cinemas and showtimes
					for cinemaName, cinemaInfo := range fwMovie.Cinemas {
						displayName := cinemaName
						if !strings.Contains(strings.ToLower(cinemaName), strings.ToLower(city)) {
							displayName = fmt.Sprintf("%s", cinemaName)
						}

						cinemaMutex.Lock()
						cinemaModel, exists := cinemasMap[displayName]
						if !exists {
							cid := fmt.Sprintf("c%d", cinemaIDCounter)
							cinemaIDCounter++

							var latVal, lngVal float64
							var coordsModel *export.CoordsModel
							if cinemaInfo.Coords != nil {
								if lat, err := strconv.ParseFloat(cinemaInfo.Coords.Lat, 64); err == nil {
									if lng, err := strconv.ParseFloat(cinemaInfo.Coords.Lng, 64); err == nil {
										latVal = lat
										lngVal = lng
										coordsModel = &export.CoordsModel{
											Lat: latVal,
											Lng: lngVal,
										}
									}
								}
							}

							cinemaModel = export.CinemaModel{
								ID:      cid,
								Name:    displayName,
								Address: cinemaInfo.Address,
								Coords:  coordsModel,
							}
							cinemasMap[displayName] = cinemaModel
						}
						cinemaMutex.Unlock()

						showtimesMutex.Lock()
						dayShowtimes = append(dayShowtimes, export.ShowtimeModel{
							MovieID:  mid,
							CinemaID: cinemaModel.ID,
							Times:    cinemaInfo.Times,
						})
						showtimesMutex.Unlock()
					}
				}
			}()
		}

		// Push jobs to workers
		for city, movieList := range rawMoviesByCity {
			for _, m := range movieList {
				jobs <- resolveJob{city: city, fwMovie: m}
			}
		}
		close(jobs)

		workerWg.Wait()

		if len(dayShowtimes) > 0 {
			finalShowtimes[pageDate] = dayShowtimes
			log.Printf("✅ Day offset %d completed with %d showtimes.\n", dayOffset, len(dayShowtimes))
		}
	}

	// Prepare final lists
	var moviesList []export.MovieModel
	for _, m := range moviesMap {
		moviesList = append(moviesList, m)
	}
	// Sort by ID to keep output consistent and clean
	sort.Slice(moviesList, func(i, j int) bool {
		idI, _ := strconv.Atoi(moviesList[i].ID[1:])
		idJ, _ := strconv.Atoi(moviesList[j].ID[1:])
		return idI < idJ
	})

	var cinemasList []export.CinemaModel
	for _, c := range cinemasMap {
		cinemasList = append(cinemasList, c)
	}
	sort.Slice(cinemasList, func(i, j int) bool {
		idI, _ := strconv.Atoi(cinemasList[i].ID[1:])
		idJ, _ := strconv.Atoi(cinemasList[j].ID[1:])
		return idI < idJ
	})

	// Deduplicate failures by title and reason
	seenFailures := make(map[string]bool)
	var uniqueFailures []export.FailureModel
	for _, f := range failures {
		key := fmt.Sprintf("%s_%s", f.Title, f.Reason)
		if !seenFailures[key] {
			uniqueFailures = append(uniqueFailures, f)
			seenFailures[key] = true
		}
	}

	var availableDates []string
	for d := range finalShowtimes {
		availableDates = append(availableDates, d)
	}
	sort.Strings(availableDates)

	metadata := export.MetadataModel{
		LastScrape:     time.Now().UTC().Format(time.RFC3339),
		TotalMovies:    len(moviesList),
		AvailableDates: availableDates,
		Failures:       uniqueFailures,
	}

	log.Printf("💾 Exporting data to %s...\n", outputPath)
	if err := export.ExportToJSON(moviesList, cinemasList, finalShowtimes, metadata, outputPath); err != nil {
		log.Fatalf("❌ Export failed: %v\n", err)
	}

	log.Println("✨ Scraping and export completed successfully!")
}
