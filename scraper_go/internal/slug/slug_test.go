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
		{"Lynch/Oz", "lynch-oz"},
		{"Victor/Victoria", "victor-victoria"},
		{"Face/Off", "face-off"},
		{"50/50", "50-50"},
		{"Frost/Nixon", "frost-nixon"},
		{"Lynch / Oz", "lynch-oz"},
		{"Spider–Man", "spider-man"}, // en-dash
		{"Ready_Player_One", "ready-player-one"},
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
		{"Lynch/Oz", 2022, "lynch-oz-2022"},
		{"Victor/Victoria", 1982, "victor-victoria-1982"},
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
