package slug

import "testing"

func TestGenerateSlug(t *testing.T) {
	tests := []struct {
		title string
		want  string
	}{
		{"Project Hail Mary", "project-hail-mary"},
		{"The Flash", "the-flash"},
		{"The Last Day of Summer", "the-last-day-of-summer"},
		{"Little Amélie or the Character of Rain", "little-amelie-or-the-character-of-rain"},
		{"Żółć", "zolc"},
		{"L'Amant de Lady Chatterley", "lamant-de-lady-chatterley"},
		{"Sacré Cœur : Son règne n'a pas de fin", "sacre-cur-son-regne-na-pas-de-fin"},
	}

	for _, tt := range tests {
		t.Run(tt.title, func(t *testing.T) {
			got := GenerateSlug(tt.title)
			if got != tt.want {
				t.Errorf("GenerateSlug(%q) = %q, want %q", tt.title, got, tt.want)
			}
		})
	}
}

func TestGenerateSlugWithYear(t *testing.T) {
	tests := []struct {
		title string
		year  int
		want  string
	}{
		{"The Last Day of Summer", 1958, "the-last-day-of-summer-1958"},
		{"Project Hail Mary", 2026, "project-hail-mary-2026"},
		{"The Flash", 2023, "the-flash-2023"},
		{"Little Amélie or the Character of Rain", 2004, "little-amelie-or-the-character-of-rain-2004"},
		{"Żółć", 2024, "zolc-2024"},
		{"L'Amant de Lady Chatterley", 2022, "lamant-de-lady-chatterley-2022"},
		{"Sacré Cœur : Son règne n'a pas de fin", 2025, "sacre-cur-son-regne-na-pas-de-fin-2025"},
		{"No Year Provided", 0, "no-year-provided"},
		{"Negative Year", -1, "negative-year"},
	}

	for _, tt := range tests {
		t.Run(tt.title, func(t *testing.T) {
			got := GenerateSlugWithYear(tt.title, tt.year)
			if got != tt.want {
				t.Errorf("GenerateSlugWithYear(%q, %d) = %q, want %q", tt.title, tt.year, got, tt.want)
			}
		})
	}
}

func TestGenerateTruncatedSlugCandidates(t *testing.T) {
	tests := []struct {
		name          string
		baseSlug      string
		expectContain string
		wantEmpty     bool
	}{
		{
			name:      "Empty slug",
			baseSlug:  "",
			wantEmpty: true,
		},
		{
			name:      "Short slug <= 45 chars",
			baseSlug:  "project-hail-mary",
			wantEmpty: true,
		},
		{
			name:      "Slug without hyphens",
			baseSlug:  "superlongtitlewithoutanyhyphensorseparatorslongerthan45characters",
			wantEmpty: true,
		},
		{
			name:          "Issue 30 - Billie Eilish Live in 3D",
			baseSlug:      "billie-eilish-hit-me-hard-and-soft-the-tour-live-in-3d",
			expectContain: "billie-eilish-hit-me-hard-and-soft-the-tour",
		},
		{
			name:          "Issue 30 - Slime movie",
			baseSlug:      "that-time-i-got-reincarnated-as-a-slime-the-movie-tears-of-the-azure-sea",
			expectContain: "that-time-i-got-reincarnated-as-a-slime-the",
		},
		{
			name:          "Issue 30 - Life Beyond the Pine Curtain",
			baseSlug:      "life-beyond-the-pine-curtain-america-the-invisible",
			expectContain: "life-beyond-the-pine-curtain-america-the",
		},
		{
			name:          "Tamara de Lempicka",
			baseSlug:      "the-true-story-of-tamara-de-lempicka-and-the-art-of-survival",
			expectContain: "the-true-story-of-tamara-de-lempicka-and",
		},
		{
			name:          "Skarpetki 3",
			baseSlug:      "the-amazing-adventures-of-lost-socks-3-socks-in-space",
			expectContain: "the-amazing-adventures-of-lost-socks-3-socks",
		},
		{
			name:          "Skarpetki 2",
			baseSlug:      "niesamowite-przygody-skarpetek-2-skarpetki-gora",
			expectContain: "niesamowite-przygody-skarpetek-2-skarpetki",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := GenerateTruncatedSlugCandidates(tt.baseSlug)
			if tt.wantEmpty {
				if len(got) != 0 {
					t.Errorf("GenerateTruncatedSlugCandidates(%q) expected empty, got %v", tt.baseSlug, got)
				}
				return
			}

			found := false
			for _, cand := range got {
				if cand == tt.expectContain {
					found = true
					break
				}
			}
			if !found {
				t.Errorf("GenerateTruncatedSlugCandidates(%q) = %v; want to contain %q", tt.baseSlug, got, tt.expectContain)
			}

			// Verify all generated candidates are <= 45 characters
			for _, cand := range got {
				if len(cand) > 45 {
					t.Errorf("GenerateTruncatedSlugCandidates candidate %q length %d > 45", cand, len(cand))
				}
			}
		})
	}
}

func TestGenerateCandidateSlugs(t *testing.T) {
	t.Run("Standard title with year", func(t *testing.T) {
		cands := GenerateCandidateSlugs("Project Hail Mary", 2026)
		expected := []string{"project-hail-mary-2026", "project-hail-mary"}
		if len(cands) != len(expected) {
			t.Fatalf("expected %d candidates, got %d: %v", len(expected), len(cands), cands)
		}
		for i, exp := range expected {
			if cands[i] != exp {
				t.Errorf("candidate[%d] = %q, want %q", i, cands[i], exp)
			}
		}
	})

	t.Run("Standard title without year", func(t *testing.T) {
		cands := GenerateCandidateSlugs("Project Hail Mary", 0)
		expected := []string{"project-hail-mary"}
		if len(cands) != len(expected) {
			t.Fatalf("expected %d candidates, got %d: %v", len(expected), len(cands), cands)
		}
		if cands[0] != expected[0] {
			t.Errorf("candidate[0] = %q, want %q", cands[0], expected[0])
		}
	})

	t.Run("Long title with year from Issue 30", func(t *testing.T) {
		cands := GenerateCandidateSlugs("Billie Eilish - Hit Me Hard and Soft: The Tour (Live in 3D)", 2026)
		// Should have full slug with year, full slug without year, and truncated candidates
		if len(cands) < 4 {
			t.Fatalf("expected at least 4 candidates, got %d: %v", len(cands), cands)
		}
		if cands[0] != "billie-eilish-hit-me-hard-and-soft-the-tour-live-in-3d-2026" {
			t.Errorf("cands[0] = %q, expected full slug with year", cands[0])
		}
		if cands[1] != "billie-eilish-hit-me-hard-and-soft-the-tour-live-in-3d" {
			t.Errorf("cands[1] = %q, expected full slug without year", cands[1])
		}

		// Ensure truncated slug candidates are present
		hasTruncatedYear := false
		hasTruncatedNoYear := false
		for _, c := range cands[2:] {
			if c == "billie-eilish-hit-me-hard-and-soft-the-tour-2026" {
				hasTruncatedYear = true
			}
			if c == "billie-eilish-hit-me-hard-and-soft-the-tour" {
				hasTruncatedNoYear = true
			}
		}
		if !hasTruncatedYear {
			t.Errorf("expected candidates to contain truncated slug with year 'billie-eilish-hit-me-hard-and-soft-the-tour-2026'")
		}
		if !hasTruncatedNoYear {
			t.Errorf("expected candidates to contain truncated slug without year 'billie-eilish-hit-me-hard-and-soft-the-tour'")
		}
	})
}
