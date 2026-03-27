from scraper.slug_utils import generate_slug

def test_slug_generation():
    assert generate_slug("Project Hail Mary", 2026) == "project-hail-mary"
    assert generate_slug("The Flash", 2023) == "the-flash-2023"

def test_slug_generation_with_accents():
    # Reported bug case
    assert generate_slug("Little Amélie or the Character of Rain", 2004) == "little-amelie-or-the-character-of-rain"
    # Polish characters case
    assert generate_slug("Żółć", 2024) == "zolc"
    # Complex title with punctuation and accents
    assert generate_slug("L'Amant de Lady Chatterley", 2022) == "lamant-de-lady-chatterley"
    # Exception (due to Letterboxd not recognizing French people, see: generate_slug)
    assert generate_slug("Sacré Cœur : Son règne n'a pas de fin", 2025) == "sacre-cur-son-regne-na-pas-de-fin"
