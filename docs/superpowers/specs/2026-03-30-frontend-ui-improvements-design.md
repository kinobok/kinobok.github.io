# Design Spec: Frontend UI Improvements (Mobile-First, Map Popups, Geolocation)

**Date:** 2026-03-30
**Status:** Draft
**Topic:** UI/UX enhancements for kinꚘbok Warsaw PoC.

## 1. Overview
This specification outlines the transition of the kinꚘbok frontend from a desktop-only PoC to a mobile-responsive application with enhanced map interactivity and location awareness.

## 2. Goals
*   **Mobile-First Design:** Implement a responsive bottom sheet for mobile users.
*   **Enhanced Map Popups:** Show movie matches and Letterboxd links directly on map pins.
*   **Browser Geolocation:** Allow users to see their current position relative to cinemas.
*   **Static Site Compatibility:** Maintain compatibility with Next.js static site generation (no server-side requirements).

## 3. Architecture & Components

### 3.1 Responsive Layout (Bottom Sheet)
The application layout will adapt based on the viewport width (breakpoint: 768px).

*   **Desktop (>= 768px):** Side-by-side layout (350px sidebar on left, map on right).
*   **Mobile (< 768px):** 
    *   `flex-direction: column-reverse`.
    *   `MatchSidebar` becomes a fixed bottom sheet.
    *   **Three States:** `collapsed` (header only), `partial` (40% height), `expanded` (90% height).
    *   Controlled via React state (`sheetState`) and CSS transitions.

### 3.2 Enhanced CinemaMap
The `CinemaMap` component will be updated to handle matches and user location.

*   **Props Update:** Add `matches: Match[]` and `userLocation?: { lat: number; lng: number }`.
*   **Popup Logic:** Filter `matches` by `cinema_id` and display a list of movie titles with Letterboxd links (`boxd_uri`).
*   **User Marker:** A special blue marker to indicate the user's position.

### 3.3 Geolocation Integration
*   **"Locate Me" Button:** A floating button on the map.
*   **API:** Uses `navigator.geolocation.getCurrentPosition`.
*   **State:** Centering the map and updating a `userLocation` state in `page.tsx`.

## 4. Technical Details

### 4.1 CSS Implementation (Approach A)
*   No new heavy dependencies (Vanilla CSS + Media Queries).
*   Use `z-index` to ensure the bottom sheet stays above the Leaflet map.
*   Smooth transitions using `transition: transform 0.3s ease-in-out`.

### 4.2 Data Flow
1.  `page.tsx` fetches `data.json`.
2.  `findMatchesWithFilters` calculates matches based on watchlist and filters.
3.  `matches` are passed to both `MatchSidebar` and `CinemaMap`.
4.  `CinemaMap` renders markers and popups based on the `matches` and `filteredCinemas`.

## 5. Testing Strategy
*   **Responsive Testing:** Verify layout transitions at 768px in browser dev tools.
*   **Interaction Testing:** Ensure clicking a map pin shows the correct matches.
*   **Geolocation Testing:** Mock coordinates to verify the blue dot appears and the map centers correctly.
*   **Link Verification:** Ensure Letterboxd links in popups are correct and open in new tabs.
