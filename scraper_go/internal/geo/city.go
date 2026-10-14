// Package geo provides geographical utilities for validating and resolving cinema locations.
package geo

import (
	"math"
)

// CityCoords defines the center coordinates of Polish cities.
var CityCoords = map[string][2]float64{
	"Warszawa":            {52.2297, 21.0122},
	"Kraków":              {50.0647, 19.9450},
	"Łódź":                {51.7592, 19.4560},
	"Wrocław":             {51.1079, 17.0385},
	"Poznań":              {52.4064, 16.9252},
	"Gdańsk":              {54.3520, 18.6466},
	"Gdynia":              {54.5189, 18.5305},
	"Sopot":               {54.4418, 18.5600},
	"Szczecin":            {53.4285, 14.5528},
	"Bydgoszcz":           {53.1235, 18.0084},
	"Toruń":               {53.0138, 18.5984},
	"Lublin":              {51.2465, 22.5684},
	"Białystok":           {53.1325, 23.1688},
	"Katowice":            {50.2649, 19.0238},
	"Gliwice":             {50.2945, 18.6714},
	"Zabrze":              {50.3249, 18.7857},
	"Bytom":               {50.3482, 18.9157},
	"Sosnowiec":           {50.2863, 19.1041},
	"Częstochowa":         {50.8118, 19.1203},
	"Radom":               {51.4027, 21.1471},
	"Kielce":              {50.8661, 20.6286},
	"Olsztyn":             {53.7784, 20.4801},
	"Bielsko-Biała":       {49.8224, 19.0469},
	"Rybnik":              {50.0971, 18.5418},
	"Ruda Śląska":         {50.2575, 18.8557},
	"Zielona Góra":        {51.9356, 15.5062},
	"Tychy":               {50.1231, 18.9868},
	"Gorzów Wielkopolski": {52.7368, 15.2288},
	"Dąbrowa Górnicza":    {50.3216, 19.1866},
	"Płock":               {52.5463, 19.7065},
	"Elbląg":              {54.1561, 19.4045},
	"Opole":               {50.6751, 17.9213},
	"Wałbrzych":           {50.7718, 16.2843},
	"Włocławek":           {52.6483, 19.0678},
	"Tarnów":              {50.0121, 20.9858},
	"Chorzów":             {50.2975, 18.9546},
	"Koszalin":            {54.1944, 16.1722},
	"Kalisz":              {51.7673, 18.0853},
	"Legnica":             {51.2070, 16.1619},
	"Siedlce":             {52.1680, 22.2690},
	"Skierniewice":        {51.9566, 20.1432},
	"Łomża":               {53.1781, 22.0594},
	"Rzeszów":             {50.0412, 21.9991},
	"Zgierz":              {51.8569, 19.4055},
	"Pabianice":           {51.6635, 19.3828},
}

// Haversine calculates the great-circle distance between two coordinates in kilometers.
func Haversine(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadiusKm = 6371.0
	dLat := (lat2 - lat1) * (math.Pi / 180.0)
	dLon := (lon2 - lon1) * (math.Pi / 180.0)

	lat1Rad := lat1 * (math.Pi / 180.0)
	lat2Rad := lat2 * (math.Pi / 180.0)

	a := math.Sin(dLat/2.0)*math.Sin(dLat/2.0) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*math.Sin(dLon/2.0)*math.Sin(dLon/2.0)
	c := 2.0 * math.Atan2(math.Sqrt(a), math.Sqrt(1.0-a))

	return earthRadiusKm * c
}

// ResolveCity validates and returns the true city for a cinema based on coordinates.
// If coordinates place the cinema within the metropolitan radius of another known city
// and far from the scraped city, the closer true city is returned.
func ResolveCity(scrapedCity string, lat, lng float64) string {
	if lat == 0 && lng == 0 {
		return scrapedCity
	}

	distToScraped := math.MaxFloat64
	if coords, exists := CityCoords[scrapedCity]; exists {
		distToScraped = Haversine(lat, lng, coords[0], coords[1])
	}

	nearestCity := scrapedCity
	minDist := distToScraped

	for city, coords := range CityCoords {
		dist := Haversine(lat, lng, coords[0], coords[1])
		if dist < minDist {
			minDist = dist
			nearestCity = city
		}
	}

	// If nearest city is close (<25 km) and scraped city is distant (>30 km), use true nearest city
	if nearestCity != scrapedCity && minDist < 25.0 && distToScraped > 30.0 {
		return nearestCity
	}

	return scrapedCity
}
