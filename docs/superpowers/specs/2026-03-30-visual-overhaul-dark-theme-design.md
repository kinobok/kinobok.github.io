# Design Spec: Visual Overhaul (Letterboxd Dark Theme)

**Date:** 2026-03-30
**Status:** Draft
**Topic:** Re-skinning the kinꚘbok frontend to match Letterboxd's aesthetic for Polish users.

## 1. Overview
This specification outlines the transformation of the kinꚘbok UI from its current generic light theme to a high-fidelity "Dark Room" theme inspired by Letterboxd's iconic color palette and layout.

## 2. Goals
*   **Brand Connection:** Use Letterboxd's signature colors (#14181c, orange/green/blue) to hint at the target audience.
*   **Immersive Map:** Transition to dark map tiles to make cinema markers pop.
*   **Rich Content:** Integrate movie poster thumbnails into the matches sidebar.
*   **Modern Typography:** Use clean sans-serif fonts mimicking Letterboxd's Graphik.

## 3. Visual Identity & Palette

### 3.1 Primary Palette (Letterboxd High Fidelity)
*   **Body Background:** `#14181c` (Primary dark).
*   **Sidebar/Cards:** `#1c232e` or `#2c3440` (Elevated elements).
*   **Primary Text:** `#ffffff` (White).
*   **Secondary Text:** `#9ab` (Muted blue-grey).
*   **Accent 1 (Orange):** `#ff8000` (Letterboxd Orange - Default Cinemas).
*   **Accent 2 (Green):** `#00e054` (Letterboxd Green - Matched Cinemas/Matches).
*   **Accent 3 (Blue):** `#40bcf4` (Letterboxd Blue - User Location/Links).

### 3.2 Typography
*   **Font Stack:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
*   **Weight:** 400 (Regular), 600 (Semi-bold), 700 (Bold).

## 4. Component Overhaul

### 4.1 MatchSidebar (Watchlist Style)
*   **Background:** `#1c232e`.
*   **Match Cards:** 
    *   Left: `img` (Poster thumbnail, 45px wide, TMDB source).
    *   Right: `div` (Title in `#fff`, Showtimes in `#9ab`).
    *   Hover: Highlight with subtle background change or border.
*   **Filters:** Styled as "Letterboxd Green" or "Orange" toggles.
*   **Empty States:** Minimalist dark placeholders.

### 4.2 CinemaMap (Dark Matter)
*   **Tile Layer:** CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`).
*   **Markers:** 
    *   Circle or pin icons using `L.divIcon` for custom CSS styling.
    *   **Colors:** Orange for all cinemas, Green for matches, Blue for user.
*   **Popups:** Styled to match the dark theme (Dark background, light text).

## 5. Technical Implementation
*   **CSS Variables:** Define the palette in `globals.css` for easy maintenance.
*   **React Leaflet:** Update `TileLayer` and `Marker` components.
*   **Poster Integration:** Use the `poster` field from `data.json`.

## 6. Testing Strategy
*   **Visual Regression:** Verify color contrast and legibility across mobile and desktop.
*   **Poster Loading:** Ensure fallbacks work if TMDB images fail to load.
*   **Map Tiles:** Verify the dark layer loads correctly and attribution is preserved.
