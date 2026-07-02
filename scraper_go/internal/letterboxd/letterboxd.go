package letterboxd

import (
	"fmt"
	"strings"

	"github.com/gocolly/colly/v2"
)

type LetterboxdScraper struct {
	BaseURL string
}

func NewLetterboxdScraper() *LetterboxdScraper {
	return &LetterboxdScraper{
		BaseURL: "https://letterboxd.com/film",
	}
}

func (s *LetterboxdScraper) GetShortURI(slug string) (string, error) {
	url := fmt.Sprintf("%s/%s/", s.BaseURL, slug)

	c := colly.NewCollector(
		colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"),
	)

	var shortURI string

	// Option 1: input.share-link
	c.OnHTML("input.share-link", func(e *colly.HTMLElement) {
		val := e.Attr("value")
		if val != "" {
			shortURI = strings.TrimSpace(val)
		}
	})

	// Option 2: a.js-share
	c.OnHTML("a.js-share", func(e *colly.HTMLElement) {
		if shortURI == "" {
			val := e.Attr("data-share-url")
			if val != "" {
				shortURI = strings.TrimSpace(val)
			}
		}
	})

	// Option 3: link[rel="shortlink"]
	c.OnHTML("link[rel=\"shortlink\"]", func(e *colly.HTMLElement) {
		if shortURI == "" {
			val := e.Attr("href")
			if val != "" {
				shortURI = strings.TrimSpace(val)
			}
		}
	})

	// Option 4: input[id^="url-field-film"]
	c.OnHTML("input[id^=\"url-field-film\"]", func(e *colly.HTMLElement) {
		if shortURI == "" {
			val := e.Attr("value")
			if val != "" {
				shortURI = strings.TrimSpace(val)
			}
		}
	})

	err := c.Visit(url)
	if err != nil {
		return "", fmt.Errorf("failed to visit Letterboxd page: %w", err)
	}

	if shortURI == "" {
		return "", fmt.Errorf("could not find short URI for slug: %s", slug)
	}

	return shortURI, nil
}
