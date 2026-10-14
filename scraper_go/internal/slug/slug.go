// Package slug provides utilities for generating movie slugs.
package slug

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

// GenerateSlug generates a Letterboxd-style slug from a movie title without year.
func GenerateSlug(title string) string {
	return GenerateSlugWithYear(title, 0)
}

// GenerateSlugWithYear generates a Letterboxd-style slug from a movie title and optional year.
// Normalizes accented characters to their base form. If year <= 0, no year suffix is appended.
func GenerateSlugWithYear(title string, year int) string {
	// Manual mapping for characters that NFKD doesn't decompose (like Polish 'ł')
	replacements := map[string]string{
		"ł": "l",
		"Ł": "l",
		"ø": "o",
		"Ø": "o",
		"ß": "ss",
	}

	slug := title
	for old, new := range replacements {
		slug = strings.ReplaceAll(slug, old, new)
	}

	// Normalize to NFKD form and remove combining marks
	t := transform.Chain(norm.NFKD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	normalized, _, err := transform.String(t, slug)
	if err == nil {
		slug = normalized
	}

	// Lowercase
	slug = strings.ToLower(slug)

	// Replace slashes, Unicode dashes, and underscores with hyphens so words don't get glued together
	// (e.g. "Lynch/Oz" -> "lynch-oz", "Spider–Man" -> "spider-man", "A_B" -> "a-b")
	separators := []string{"/", "\\", "–", "—", "−", "_"}
	for _, sep := range separators {
		slug = strings.ReplaceAll(slug, sep, "-")
	}

	// Remove non-alphanumeric except spaces and hyphens
	reg := regexp.MustCompile(`[^a-z0-9\s-]`)
	slug = reg.ReplaceAllString(slug, "")

	// Replace spaces and multiple hyphens with single hyphen
	regSpace := regexp.MustCompile(`[\s-]+`)
	slug = regSpace.ReplaceAllString(slug, "-")

	// Strip hyphens from ends
	slug = strings.Trim(slug, "-")

	if year > 0 {
		return fmt.Sprintf("%s-%d", slug, year)
	}

	return slug
}
