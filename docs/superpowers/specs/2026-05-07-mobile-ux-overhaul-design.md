# Design Spec: Map-Centric Mobile UX

**Date:** 2026-05-07
**Status:** Draft
**Topic:** Redesigning the mobile experience to resemble Google Maps.

## 1. Overview
This specification outlines the transition from a sidebar-heavy layout to a map-centric interface, specifically optimized for mobile users while maintaining desktop parity. The design mimics Google Maps' "floating controls + bottom sheet" pattern.

## 2. Goals
*   **Mobile-First Navigation:** Intuitive bottom sheet and floating search.
*   **Search Integration:** Unified search for movies and cinemas.
*   **Clearer Map Context:** Cinema names visible on zoom.
*   **Clean Interface:** Moving configuration (upload/filters) to a hamburger menu.

## 3. UI/UX Components

### 3.1 Floating Search Bar (`SearchBar.tsx`)
*   **Placement:** Top of the viewport with safe-area padding.
*   **Features:**
    *   **Hamburger Menu Icon (Left):** Opens the Configuration Drawer.
    *   **Search Input:** Integrated search for movies (matches) and cinemas.
*   **Desktop Behavior:** Remains at the top left of the map.

### 3.2 Configuration Drawer (`ConfigMenu.tsx`)
*   **Trigger:** Hamburger icon in the search bar.
*   **Content:**
    *   App Branding: "kinꚘbok Warsaw"
    *   Upload Section: Letterboxd ZIP/CSV upload.
    *   Advanced Filters: Chain selection toggles.
*   **Mobile:** Slides in from the left, covering the screen partially.
*   **Desktop:** Could be a popover or side drawer.

### 3.3 Match Bottom Sheet (`MatchSidebar.tsx` refactor)
*   **States (Mobile):**
    1.  **Folded:** Fixed at the bottom (~60px height). Displays "Matches Found: {count}" and a drag handle.
    2.  **Expanded:** Transitions to 100% height. Displays a full list of matches.
*   **Controls:**
    *   **Folded State:** Clicking anywhere on the bar expands it.
    *   **Expanded State:** "Arrow Down" button in the top-left to return to folded state.
*   **Desktop:** Remains a fixed-width sidebar (350px) on the left.

### 3.4 Map Controls (`CinemaMap.tsx`)
*   **Relocation:** Move Zoom (+/-) and "Locate Me" buttons to the **bottom-right**.
*   **Dynamic Positioning:** On mobile, these must sit above the *folded* bottom sheet (approx `bottom: 80px`).
*   **Cinema Labels:** Marker labels (names) appear only when `zoom >= 15`.

## 4. Technical Implementation

### 4.1 Search Logic
*   **State:** A `searchQuery` state in `page.tsx`.
*   **Filtering:**
    *   `matches` are filtered by movie title.
    *   `cinemas` markers are filtered by name.
*   **Interaction:** Selecting a cinema result pans the map. Selecting a movie result expands the bottom sheet.

### 4.2 Layout Architecture
*   Use `fixed` positioning for the Search Bar and Map Controls.
*   The Bottom Sheet uses CSS transitions for smooth height changes.
*   `z-index` management:
    *   Map: 0
    *   Controls: 1000
    *   Search Bar: 1100
    *   Bottom Sheet: 1200
    *   Config Drawer: 1300

## 5. Testing Strategy
*   **Responsive Breakpoints:** Verify the shift at 768px.
*   **Touch Interactions:** Test swipe-to-expand (if using a library like `react-spring`) or click-to-expand.
*   **Zoom Sensitivity:** Confirm cinema labels appear/disappear at the correct zoom level.
*   **Search Accuracy:** Verify unified results for both data types.
