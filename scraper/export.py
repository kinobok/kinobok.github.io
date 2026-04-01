import json
from typing import List, Dict, Optional
from pydantic import BaseModel, HttpUrl, ValidationError


class MovieModel(BaseModel):
    id: str
    title: str
    poster: Optional[str] = None
    boxd_uri: str  # Must start with https://boxd.it/ as per spec


class CoordsModel(BaseModel):
    lat: float
    lng: float


class CinemaModel(BaseModel):
    id: str
    name: str
    address: str
    coords: Optional[CoordsModel] = None


class ShowtimeModel(BaseModel):
    movie_id: str
    cinema_id: str
    times: List[str]


class ExportSchema(BaseModel):
    movies: List[MovieModel]
    cinemas: List[CinemaModel]
    showtimes: List[ShowtimeModel]


def export_to_json(
    movies: List[Dict], cinemas: List[Dict], showtimes: List[Dict], output_file: str
):
    try:
        data = ExportSchema(movies=movies, cinemas=cinemas, showtimes=showtimes)

        with open(output_file, "w") as f:
            f.write(data.model_dump_json(indent=2))

    except ValidationError as e:
        raise ValueError(f"Data validation failed: {e}")
