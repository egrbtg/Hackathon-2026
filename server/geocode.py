"""Turn a place name into coordinates.

Uses the Google Maps Geocoding API when GOOGLE_MAPS_API_KEY is set (server/.env),
otherwise falls back to OpenStreetMap's free Nominatim service (no key, ~1 request/sec).

    from geocode import geocode
    geocode("Eiffel Tower")
    # {'name': 'Eiffel Tower, Paris, France', 'lat': 48.858..., 'lng': 2.294..., 'source': 'osm'}
"""

import json
import os
import time
import urllib.parse
import urllib.request
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

TIMEOUT_SECONDS = 10
USER_AGENT = "hackathon-2026-geocoder/1.0"  # Nominatim requires an identifying User-Agent


def _get_json(url: str, params: dict) -> dict | list:
    full_url = f"{url}?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(full_url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        return json.load(response)


def _google(place: str, key: str) -> dict | None:
    data = _get_json(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {"address": place, "key": key},
    )
    status = data.get("status")
    if status == "ZERO_RESULTS":
        return None
    if status != "OK":
        raise RuntimeError(f"Google geocoding failed: {status} {data.get('error_message', '')}")
    top = data["results"][0]
    loc = top["geometry"]["location"]
    return {"name": top["formatted_address"], "lat": loc["lat"], "lng": loc["lng"], "source": "google"}


_last_osm_call = 0.0


def _osm(place: str) -> dict | None:
    # Nominatim's usage policy allows at most 1 request per second.
    global _last_osm_call
    wait = 1.0 - (time.monotonic() - _last_osm_call)
    if wait > 0:
        time.sleep(wait)
    _last_osm_call = time.monotonic()
    results = _get_json(
        "https://nominatim.openstreetmap.org/search",
        {"q": place, "format": "json", "limit": 1},
    )
    if not results:
        return None
    top = results[0]
    return {"name": top["display_name"], "lat": float(top["lat"]), "lng": float(top["lon"]), "source": "osm"}


@lru_cache(maxsize=512)
def geocode(place: str) -> dict | None:
    """Return {'name', 'lat', 'lng', 'source'} for a place name, or None if not found."""
    place = place.strip()
    if not place:
        return None
    key = os.getenv("GOOGLE_MAPS_API_KEY")
    return _google(place, key) if key else _osm(place)


if __name__ == "__main__":
    import sys

    print(geocode(" ".join(sys.argv[1:]) or "Eiffel Tower"))
