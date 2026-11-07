"""Find the places mentioned in free text and attach coordinates.

Gemini extracts place names (made specific enough to geocode), then geocode.py looks them up.

    from places import find_places
    find_places("We flew into Lisbon, then took the train to Porto.")
    # [{'mention': 'Lisbon', 'query': 'Lisbon, Portugal', 'name': ..., 'lat': ..., 'lng': ..., 'source': ...},
    #  {'mention': 'Porto', ...}]
"""

import json

from gemini import ask_gemini
from geocode import geocode

SYSTEM = """You extract real-world places from text.
Return JSON: {"places": [{"mention": str, "query": str}]}
- mention: the place exactly as written in the text.
- query: a search string specific enough for a geocoder. Use the place's full official name,
  plus its street address if you know it, then city, region and country.
  e.g. "Springfield, Illinois, USA", "The Alamo, 300 Alamo Plaza, San Antonio, Texas, USA".
- Use context from the text to resolve vague references: "the convention center downtown" in a
  text about San Antonio is "Henry B. Gonzalez Convention Center, San Antonio, Texas, USA".
  Leave a place out only if it cannot be pinned down at all (e.g. "home", "my office").
- List each place once, in the order it first appears. Return {"places": []} if there are none."""


def extract_places(text: str) -> list[dict]:
    """Ask Gemini for the places in `text`. Returns [{'mention', 'query'}, ...]."""
    raw = ask_gemini(text, system=SYSTEM, json_output=True, temperature=0)
    try:
        places = json.loads(raw).get("places", [])
    except (json.JSONDecodeError, AttributeError):
        return []
    return [p for p in places if isinstance(p, dict) and p.get("query")]


def find_places(text: str) -> list[dict]:
    """Extract places from `text` and geocode them.

    Each result has 'mention' and 'query', plus 'name', 'lat', 'lng', 'source' when found.
    Places the geocoder can't find come back with lat/lng set to None.
    """
    results = []
    for place in extract_places(text):
        try:
            hit = geocode(place["query"])
        except Exception as e:  # network error, quota, etc. — keep the other places
            print(f"[places] geocoding {place['query']!r} failed: {e}")
            hit = None
        results.append({**place, **(hit or {"name": None, "lat": None, "lng": None, "source": None})})
    return results


if __name__ == "__main__":
    import sys

    sample = " ".join(sys.argv[1:]) or (
        "Flooding was reported near the Alamo this morning, and shelters opened in "
        "New Braunfels and at the convention center downtown."
    )
    for p in find_places(sample):
        print(p)
