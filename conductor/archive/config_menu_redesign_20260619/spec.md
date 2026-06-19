# Specification: Config Menu Redesign & Dashboard Button Relocation

## Overview
This track delivers a major UX redesign of the `ConfigMenu` and cleans up the map toolbar interactions. It transforms the menu into a sleek left-side sliding drawer panel (mimicking Google Maps' side panel UI, ~390px wide on desktop/mobile), organizes settings into a tabbed layout, and relocates the Scrape Dashboard button to reduce search bar clutter.

## Functional Requirements
- **Google Maps-Style Left Drawer:**
  - The `ConfigMenu` must be refactored from a centered overlay modal to a left-side sliding drawer panel.
  - Desktop/Mobile width should be sleek (around 390px - 400px), with a smooth left-to-right slide-in transition.
  - Use a slide-out left-to-right transition on close.
- **Tabbed Categories Organization:**
  - Settings must be split into four distinct tab panels:
    1. **Upload:** Watchlist file (.csv/.zip) uploader.
    2. **Cinemas:** Individual cinema toggles and big chain visibility checkboxes.
    3. **Excluded Movies:** List of hidden movies and "Restore" buttons.
    4. **Other:** "Show All Screenings" switch, "Sort Screenings By" dropdown select, and the "Scrape Dashboard" button.
- **Relocated Scrape Dashboard Button:**
  - The Scrape Dashboard button (📊) must be removed from `SearchBar.tsx` completely.
  - A new, prominent, full-width colored button labeled `📊 Scrape Dashboard` must be added at the bottom of the "Other" tab inside the `ConfigMenu`.
  - Clicking this button must open the `DashboardModal`.

## Non-Functional Requirements
- **Animations:** Implement a smooth CSS transition (`transform: translateX(...)` or similar) for sliding in/out from the left side of the viewport.
- **Theme:** Maintain the established minimalist dark and cinematic aesthetic. Use clear active/inactive visual styles for the tabs at the top of the menu.

## Acceptance Criteria
- [ ] Scrape Dashboard button is removed from `SearchBar.tsx`.
- [ ] ConfigMenu slides in smoothly from the left side when opened.
- [ ] ConfigMenu slides out to the left when closed.
- [ ] Desktop/Mobile width is constrained to a sleek width (approx 390px - 400px) instead of centered modal styles.
- [ ] ConfigMenu header contains a clean tab bar dividing Upload, Cinemas, Excluded Movies, and Other.
- [ ] Each tab displays only its corresponding mapped content.
- [ ] A full-width `📊 Scrape Dashboard` button is visible at the bottom of the "Other" tab, successfully opening the Scrape Dashboard modal when clicked.

## Out of Scope
- Changing the underlying upload processing logic or database formatting.
- Redesigning the `DashboardModal` itself; only the trigger button is relocated.