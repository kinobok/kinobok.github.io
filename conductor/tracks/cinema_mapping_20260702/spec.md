# Specification: Cinema Schedule URL Mapping

## Overview
This track involves creating a reference JSON file that maps a list of Polish cinemas (from `docs/cinema_list.txt`) to their specific screening schedule URLs and geographical coordinates (from `frontend/public/data.json`).

## Functional Requirements
1. **Name Parsing:** Read and parse all cinema names listed in `docs/cinema_list.txt`.
2. **Coordinate Extraction:** Search `frontend/public/data.json` to find the corresponding latitude and longitude for each parsed cinema.
3. **URL Discovery:** 
   - Dynamically generate or search for the specific "repertuar" (screening schedule) URL for each cinema.
   - For major chains (Cinema City, Multikino, Helios), construct the URLs programmatically based on the cinema's location or name.
   - For independent cinemas, find the dedicated schedule page (e.g., `https://kinomuranow.pl/repertuar`).
4. **Data Aggregation:** Combine the Name, Coordinates (lat/lng), and Schedule URL into a structured format.

## Non-Functional Requirements
1. **Output Format:** The final output MUST be an Array of Objects, following this schema:
   `[{"name": "Cinema Name", "url": "https://...", "lat": 52.0, "lng": 21.0}, ...]`
2. **Output Location:** The generated file MUST be saved as a static reference file in the `docs/` directory (e.g., `docs/cinema_urls.json`).
3. **Accuracy:** The scraper/discovery script must prioritize accuracy over speed when guessing URLs for independent cinemas, prompting the user for manual assistance if a URL cannot be reliably determined.

## Acceptance Criteria
- [ ] A script or manual process has successfully iterated through all names in `cinema_list.txt`.
- [ ] Coordinates for each matched cinema are successfully extracted from `data.json`.
- [ ] Schedule URLs are accurately gathered or constructed for all listed cinemas.
- [ ] The final `docs/cinema_urls.json` file is generated, valid, and matches the specified Array of Objects schema.

## Out of Scope
- Integrating this JSON file directly into the Next.js frontend application or Python/Go backends.
- Modifying the existing scraper logic to utilize this file immediately.