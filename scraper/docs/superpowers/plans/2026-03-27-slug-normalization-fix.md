# Slug Normalization Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 404 errors in Letterboxd URI resolution by properly normalizing accented characters in movie titles during slug generation.

**Architecture:** Update `generate_slug` to use `unicodedata.normalize('NFKD')` for decomposing accented characters, filter out combining marks, and then perform standard slugification (lowercase, alphanumeric filtering, hyphenation).

**Tech Stack:** Python 3.x, `unicodedata`, `re`, `pytest`.

---

### Task 1: Add failing tests for accented characters

**Files:**
- Modify: `tests/test_slugs.py`

- [ ] **Step 1: Write the failing tests**

```python
from scraper.slug_utils import generate_slug

def test_slug_generation_with_accents():
    # Reported bug case
    assert generate_slug("Little Amélie or the Character of Rain", 2004) == "little-amelie-or-the-character-of-rain"
    # Polish characters case
    assert generate_slug("Żółć", 2024) == "zolc"
    # Complex title with punctuation and accents
    assert generate_slug("L'Amant de Lady Chatterley", 2022) == "lamant-de-lady-chatterley"
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest tests/test_slugs.py -v`
Expected: FAIL (assertion error for "little-amlie-or-the-character-of-rain" vs "little-amelie-or-the-character-of-rain")

- [ ] **Step 3: Commit tests**

```bash
git add tests/test_slugs.py
git commit -m "test: add failing test cases for accented slug generation"
```

### Task 2: Implement robust normalization in slug_utils.py

**Files:**
- Modify: `slug_utils.py`

- [ ] **Step 1: Implement the normalization logic**

```python
import re
import unicodedata

def generate_slug(title: str, year: int) -> str:
    """
    Generates a Letterboxd-style slug from a movie title and year.
    Normalizes accented characters to their base form.
    """
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
```

- [ ] **Step 2: Run all tests to verify they pass**

Run: `pytest tests/test_slugs.py -v`
Expected: PASS (all 5 tests should pass)

- [ ] **Step 3: Commit implementation**

```bash
git add slug_utils.py
git commit -m "fix: implement unicode normalization in generate_slug"
```

### Task 3: Final verification with the full test suite

- [ ] **Step 1: Run all tests in the scraper**

Run: `pytest tests/ -v`
Expected: All tests pass (including test_filmweb.py, test_letterboxd.py, etc.)

- [ ] **Step 2: Commit any final cleanup**

```bash
git commit --allow-empty -m "chore: final verification of slug normalization fix"
```
