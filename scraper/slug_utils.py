import re
import unicodedata

def generate_slug(title: str, year: int) -> str:
    """
    Generates a Letterboxd-style slug from a movie title and year.
    Normalizes accented characters to their base form.
    """
    # 0. Manual mapping for characters that NFKD doesn't decompose (like Polish 'ł')
    replacements = {
        'ł': 'l', 'Ł': 'l',
        'ø': 'o', 'Ø': 'o',
        # 'æ': 'ae', 'Æ': 'ae',
        # 'œ': 'oe', 'Œ': 'oe',
        # It seems that letterboxd does not recognize French people:
        # https://letterboxd.com/film/sacre-cur-son-regne-na-pas-de-fin/
        # https://letterboxd.com/film/sacre-cur/
        'ß': 'ss'
    }
    for old, new in replacements.items():
        title = title.replace(old, new)

    # 1. Normalize to NFKD form (decomposes 'é' to 'e' + combining accent)
    normalized = unicodedata.normalize('NFKD', title)
    # 2. Filter out combining marks
    slug = "".join([c for c in normalized if not unicodedata.combining(c)])
    # 3. Lowercase and remove non-alphanumeric (except spaces and hyphens)
    slug = slug.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # 4. Replace spaces and multiple hyphens with single hyphen
    slug = re.sub(r'[\s-]+', '-', slug).strip('-')
    
    # Letterboxd specific: Some titles require year to be unique.
    ambiguous_titles = {"The Flash"}
    
    if title in ambiguous_titles:
        return f"{slug}-{year}"
    
    return slug
