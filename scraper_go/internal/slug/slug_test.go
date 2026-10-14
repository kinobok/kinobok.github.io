package slug

import "testing"

func TestGenerateSlug(t *testing.T) {
	tests := []struct {
		title string
		year  int
		want  string
	}{
		{"Project Hail Mary", 2026, "project-hail-mary"},
		{"The Flash", 2023, "the-flash-2023"},
		{"Little Amélie or the Character of Rain", 2004, "little-amelie-or-the-character-of-rain"},
		{"Żółć", 2024, "zolc"},
		{"L'Amant de Lady Chatterley", 2022, "lamant-de-lady-chatterley"},
		{"Sacré Cœur : Son règne n'a pas de fin", 2025, "sacre-cur-son-regne-na-pas-de-fin"},
		{"Lynch/Oz", 2022, "lynch-oz"},
		{"Victor/Victoria", 1982, "victor-victoria"},
		{"Face/Off", 1997, "face-off"},
		{"50/50", 2011, "50-50"},
		{"Frost/Nixon", 2008, "frost-nixon"},
		{"Lynch / Oz", 2022, "lynch-oz"},
		{"Spider–Man", 2002, "spider-man"}, // en-dash
		{"Ready_Player_One", 2018, "ready-player-one"},
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
