package geo

import (
	"testing"
)

func TestHaversine(t *testing.T) {
	// Warsaw to Krakow distance is ~250-260 km
	waw := CityCoords["Warszawa"]
	krk := CityCoords["Kraków"]
	dist := Haversine(waw[0], waw[1], krk[0], krk[1])

	if dist < 240.0 || dist > 270.0 {
		t.Errorf("Expected Warsaw to Krakow distance ~252 km, got %f km", dist)
	}
}

func TestResolveCity(t *testing.T) {
	// 1. Manufaktura in Lodz scraped under Skierniewice
	manufakturaLat := 51.7808431
	manufakturaLng := 19.4478647
	resolved := ResolveCity("Skierniewice", manufakturaLat, manufakturaLng)
	if resolved != "Łódź" {
		t.Errorf("Expected Cinema City Manufaktura to resolve to 'Łódź', got '%s'", resolved)
	}

	// 2. Genuine Skierniewice cinema (Kino Polonez)
	polonezLat := 51.9608618
	polonezLng := 20.1472306
	resolved = ResolveCity("Skierniewice", polonezLat, polonezLng)
	if resolved != "Skierniewice" {
		t.Errorf("Expected Kino Polonez to remain 'Skierniewice', got '%s'", resolved)
	}

	// 3. Genuine Warsaw cinema (Kinoteka)
	kinotekaLat := 52.231
	kinotekaLng := 21.006
	resolved = ResolveCity("Warszawa", kinotekaLat, kinotekaLng)
	if resolved != "Warszawa" {
		t.Errorf("Expected Kinoteka to remain 'Warszawa', got '%s'", resolved)
	}

	// 4. Fallback for zero coordinates
	resolved = ResolveCity("Skierniewice", 0, 0)
	if resolved != "Skierniewice" {
		t.Errorf("Expected zero coords to retain scraped city, got '%s'", resolved)
	}
}
