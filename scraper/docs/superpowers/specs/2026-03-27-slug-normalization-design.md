# Design Spec: Letterboxd Slug Normalization Fix

**Topic:** Slug normalization in kinobok scraper to correctly handle accented characters.
**Date:** Friday, March 27, 2026

## Problem Statement
The current slug generation logic in `slug_utils.py` uses a simple regex `re.sub(r'[^a-z0-9\s-]', '', slug)` to strip everything that isn't alphanumeric, space, or hyphen. This causes accented characters like "é" in "Amélie" to be entirely removed (resulting in "amlie"), which leads to 404 errors when trying to resolve Letterboxd URIs.

## Goals
1. Accurately generate Letterboxd-style slugs by normalizing accented characters to their base Latin form (e.g., "é" to "e").
2. Handle Polish/European characters commonly found in movie titles.
3. Maintain current functionality for ambiguous titles (appending year).

## Proposed Solution
We will use Python's built-in `unicodedata` module to perform **NFKD (Normalization Form Compatibility Decomposition)**. This decomposes characters into their base character and their accent/mark. We will then filter out characters in the "Nonspacing Mark" (Mn) category.

### Algorithm
1.  **Manual Mapping**: Replace characters that NFKD doesn't decompose (e.g., 'ł' -> 'l', 'ø' -> 'o', 'æ' -> 'ae', 'œ' -> 'oe', 'ß' -> 'ss').
2.  **Normalize**: Decompose input title using `unicodedata.normalize('NFKD', title)`.
3.  **Filter Marks**: Iterate through characters and keep only those for which `unicodedata.combining(c)` is false (filtering out combining accents).
4.  **Clean**: Lowercase, remove remaining non-alphanumeric/hyphen/space characters via regex.
5.  **Hyphenate**: Replace spaces and multiple hyphens with a single hyphen.
6.  **Ambiguity Check**: Check if title is in `ambiguous_titles` and append year if necessary.

## Implementation Details
### File: `scraper/slug_utils.py`
```python
import re
import unicodedata

def generate_slug(title: str, year: int) -> str:
    # 0. Manual mapping for characters that NFKD doesn't decompose (like Polish 'ł')
    replacements = {
        'ł': 'l', 'Ł': 'l',
        'ø': 'o', 'Ø': 'o',
        # 'æ': 'ae', 'Æ': 'ae',
        # 'Œ': 'oe', 'œ': 'oe',
        # It seems that letterboxd does not recognize French people:
        # https://letterboxd.com/film/sacre-cur-son-regne-na-pas-de-fin/
        # https://letterboxd.com/film/sacre-cur/
        'ß': 'ss'
    }
    for old, new in replacements.items():
        title = title.replace(old, new)

    # 1. Normalize to NFKD form
    normalized = unicodedata.normalize('NFKD', title)
    # 2. Filter out combining marks (accents)
    slug = "".join([c for c in normalized if not unicodedata.combining(c)])
    # 3. Lowercase and basic cleanup
    slug = slug.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # 4. Replace spaces and multiple hyphens with single hyphen
    slug = re.sub(r'[\s-]+', '-', slug).strip('-')
    
    ambiguous_titles = {"The Flash"}
    if title in ambiguous_titles:
        return f"{slug}-{year}"
    
    return slug
```

## Testing Strategy
- Add a test case for "Little Amélie or the Character of Rain" -> "little-amelie-or-the-character-of-rain".
- Add a test case for Polish characters: "Żółć" -> "zolc".
- Ensure existing tests (Project Hail Mary, The Flash) still pass.
