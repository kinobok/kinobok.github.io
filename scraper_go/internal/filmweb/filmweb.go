package filmweb

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/gocolly/colly/v2"
)

type FilmwebCinema struct {
	Address string   `json:"address"`
	Times   []string `json:"times"`
	Coords  *Coords  `json:"coords"`
}

type Coords struct {
	Lat string `json:"lat"`
	Lng string `json:"lng"`
}

type FilmwebMovie struct {
	Title         string                    `json:"title"`
	OriginalTitle string                    `json:"original_title"`
	Year          int                       `json:"year"`
	Cinemas       map[string]*FilmwebCinema `json:"cinemas"`
}

type FilmwebResult struct {
	Date   string          `json:"date"`
	Movies []*FilmwebMovie `json:"movies"`
}

type FilmwebScraper struct {
	BaseURL string
}

func NewFilmwebScraper() *FilmwebScraper {
	return &FilmwebScraper{
		BaseURL: "https://www.filmweb.pl",
	}
}

// Scrape fetches showtimes and cinema details from Filmweb for a given city and day offset.
func (s *FilmwebScraper) Scrape(city string, dayOffset int, limit int) (*FilmwebResult, error) {
	url := fmt.Sprintf("%s/showtimes/%s", s.BaseURL, city)
	if dayOffset > 0 {
		url = fmt.Sprintf("%s?day=%d", url, dayOffset)
	}

	c := colly.NewCollector(
		colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"),
	)

	type scrapedMovieLink struct {
		Title string
		URL   string
	}

	var movieLinks []scrapedMovieLink

	c.OnHTML(".preview__title a", func(e *colly.HTMLElement) {
		title := strings.TrimSpace(e.Text)
		href := e.Attr("href")
		if title != "" && href != "" {
			movieLinks = append(movieLinks, scrapedMovieLink{Title: title, URL: href})
		}
	})

	err := c.Visit(url)
	if err != nil {
		return nil, fmt.Errorf("failed to visit city page: %w", err)
	}

	if len(movieLinks) == 0 {
		pageDate := time.Now().AddDate(0, 0, dayOffset).Format("2006-01-02")
		return &FilmwebResult{
			Date:   pageDate,
			Movies: []*FilmwebMovie{},
		}, nil
	}

	if limit > 0 && len(movieLinks) > limit {
		movieLinks = movieLinks[:limit]
	}

	type movieResult struct {
		movie *FilmwebMovie
		err   error
	}

	resultsChan := make(chan movieResult, len(movieLinks))

	for _, link := range movieLinks {
		go func(title, movieURL string) {
			fullMovieURL := movieURL
			if !strings.HasPrefix(movieURL, "http://") && !strings.HasPrefix(movieURL, "https://") {
				fullMovieURL = s.BaseURL + movieURL
			}
			showtimesURL := fmt.Sprintf("%s/showtimes/%s", fullMovieURL, city)
			if dayOffset > 0 {
				showtimesURL = fmt.Sprintf("%s?day=%d", showtimesURL, dayOffset)
			}

			movieCollector := colly.NewCollector(
				colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"),
			)

			movie := &FilmwebMovie{
				Title:   title,
				Cinemas: make(map[string]*FilmwebCinema),
			}

			movieCollector.OnHTML(".preview__alternateTitle", func(e *colly.HTMLElement) {
				movie.OriginalTitle = strings.TrimSpace(e.Text)
			})

			movieCollector.OnHTML(".preview__year", func(e *colly.HTMLElement) {
				yearStr := strings.TrimSpace(e.Text)
				if val, err := strconv.Atoi(yearStr); err == nil {
					movie.Year = val
				}
			})

			movieCollector.OnHTML(".seanceTiles", func(e *colly.HTMLElement) {
				cinemaName := strings.TrimSpace(e.ChildText(".seanceTiles__title"))
				if cinemaName == "" {
					return
				}

				address := strings.TrimSpace(e.ChildText(".seanceTiles__address"))
				if address == "" {
					address = fmt.Sprintf("%s, Poland", city)
				}

				lat := e.Attr("data-cinema-latitude")
				lng := e.Attr("data-cinema-longitude")

				var times []string
				e.ForEach(".seanceTile__value", func(i int, item *colly.HTMLElement) {
					timeVal := strings.TrimSpace(item.Text)
					if timeVal != "" {
						times = append(times, timeVal)
					}
				})

				if len(times) > 0 {
					var coords *Coords
					if lat != "" && lng != "" {
						coords = &Coords{
							Lat: lat,
							Lng: lng,
						}
					}
					movie.Cinemas[cinemaName] = &FilmwebCinema{
						Address: address,
						Times:   times,
						Coords:  coords,
					}
				}
			})

			err := movieCollector.Visit(showtimesURL)
			if err != nil {
				resultsChan <- movieResult{err: fmt.Errorf("failed to visit movie %s: %w", title, err)}
				return
			}

			resultsChan <- movieResult{movie: movie}
		}(link.Title, link.URL)
	}

	movies := make([]*FilmwebMovie, 0, len(movieLinks))
	for i := 0; i < len(movieLinks); i++ {
		res := <-resultsChan
		if res.err != nil {
			fmt.Printf("Error scraping movie showtimes: %v\n", res.err)
			continue
		}
		if res.movie != nil {
			movies = append(movies, res.movie)
		}
	}

	pageDate := time.Now().AddDate(0, 0, dayOffset).Format("2006-01-02")
	return &FilmwebResult{
		Date:   pageDate,
		Movies: movies,
	}, nil
}
