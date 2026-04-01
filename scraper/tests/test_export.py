import os
import json
import pytest
from scraper.export import export_to_json


def test_export_to_json_valid_data(tmp_path):
    output_file = tmp_path / "data.json"

    movies = [
        {
            "id": "m1",
            "title": "Project Hail Mary",
            "poster": "http://example.com/poster.jpg",
            "boxd_uri": "https://boxd.it/pEeQ",
        }
    ]
    cinemas = [
        {
            "id": "c1",
            "name": "Kino Muranów",
            "address": "ul. Gen. Andersa 5, 00-147 Warszawa",
            "coords": {"lat": 52.249, "lng": 20.999},
        }
    ]
    showtimes = [{"movie_id": "m1", "cinema_id": "c1", "times": ["18:00", "21:00"]}]

    export_to_json(movies, cinemas, showtimes, str(output_file))

    assert os.path.exists(output_file)
    with open(output_file, "r") as f:
        data = json.load(f)

    assert "movies" in data
    assert "cinemas" in data
    assert "showtimes" in data
    assert len(data["movies"]) == 1
    assert data["movies"][0]["title"] == "Project Hail Mary"
    assert data["movies"][0]["boxd_uri"] == "https://boxd.it/pEeQ"


def test_export_to_json_invalid_data(tmp_path):
    output_file = tmp_path / "data_invalid.json"

    # Missing required field 'boxd_uri'
    movies = [{"id": "m1", "title": "Invalid Movie"}]
    cinemas = []
    showtimes = []

    with pytest.raises(ValueError):
        export_to_json(movies, cinemas, showtimes, str(output_file))
