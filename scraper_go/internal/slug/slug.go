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

// GenerateTruncatedSlugCandidates generates truncated candidate slugs for a movie slug
// when the slug is too long (> 45 characters) and may have been truncated by Letterboxd.
// Returns candidate slugs in descending order of length, preferring longer whole-word prefixes.
func GenerateTruncatedSlugCandidates(baseSlug string) []string {
	const maxLen = 45
	const minLen = 20
	const maxCandidates = 3

	if len(baseSlug) <= maxLen || !strings.Contains(baseSlug, "-") {
		return nil
	}

	words := strings.Split(baseSlug, "-")
	if len(words) <= 1 {
		return nil
	}

	var candidates []string
	for i := len(words) - 1; i >= 1; i-- {
		cand := strings.Join(words[:i], "-")
		if len(cand) <= maxLen {
			if len(cand) >= minLen || len(candidates) == 0 {
				candidates = append(candidates, cand)
			}
			if len(candidates) >= maxCandidates {
				break
			}
		}
	}

	return candidates
}

// GenerateCandidateSlugs returns an ordered list of candidate Letterboxd slugs to attempt.
// Tries more specific candidates first:
// 1. Full slug with year (if year > 0)
// 2. Full slug without year
// 3. Truncated slug candidates with and without year (for slugs > 45 characters)
func GenerateCandidateSlugs(title string, year int) []string {
	var candidates []string
	baseSlug := GenerateSlug(title)

	// 1. Full slug with year (if year > 0)
	if year > 0 {
		candidates = append(candidates, GenerateSlugWithYear(title, year))
	}

	// 2. Full slug without year
	candidates = append(candidates, baseSlug)

	// 3. Truncated candidates for long slugs
	for _, truncated := range GenerateTruncatedSlugCandidates(baseSlug) {
		if year > 0 {
			candidates = append(candidates, fmt.Sprintf("%s-%d", truncated, year))
		}
		candidates = append(candidates, truncated)
	}

	return candidates
}
