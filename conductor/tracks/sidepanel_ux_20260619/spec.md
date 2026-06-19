# Specification: UX Revamp for Sidepanel (Match Sidebar)

## Overview
This track aims to revamp the user experience of the sidepanel (`MatchSidebar`), specifically targeting the mobile experience and consolidating map-related controls into the sidebar layout. The updates will maintain the current visual theme and focus primarily on styling, layout, and component relocation.

## Functional Requirements
- **Mobile Sliding Panel:** The sidepanel on mobile devices must feature a sliding motion from the bottom, replicating the interaction pattern of Google Maps' bottom panel.
- **Expanded State Layout:**
  - When the bottom panel is expanded, the "Hide" button must be relocated into a separate dedicated `div` at the top of the panel.
  - A new "Search" button (using a magnifying glass icon) must be added to the right side of this same `div`.
- **Search Integration:** Clicking the new "Search" button in the sidepanel must programmatically focus the existing Search Bar located in the map view, allowing the user to immediately start typing.
- **Timeline Selector Relocation:**
  - The Timeline Selector (`DateSelector`) must be moved from its current location in the Map View and placed inside the Match Sidepanel.
  - The appearance of the Timeline Selector must be adjusted (scaled down) to properly fit within the tighter constraints of the sidepanel.

## Non-Functional Requirements
- **Styling:** The changes must rely primarily on CSS/styling updates (and necessary React structural adjustments for component relocation) without overhauling the underlying data models.
- **Theme:** The current color scheme and design language must be preserved.
- **Responsiveness:** The sliding panel interaction is specifically for the mobile viewport; desktop behavior should remain a traditional sidepanel unless otherwise adapted.

## Acceptance Criteria
- [ ] On mobile view, the sidepanel slides up smoothly from the bottom of the screen.
- [ ] When expanded, the "Hide" button is in its own header container at the top of the panel.
- [ ] A Search button (magnifying glass) appears next to the Hide button (on the right) in the expanded view.
- [ ] Clicking the Search button focuses the map's search bar.
- [ ] The Timeline Selector is no longer floating on the map but is integrated into the sidepanel.
- [ ] The Timeline Selector fits neatly within the sidepanel without breaking the layout.

## Out of Scope
- Complete redesign of the app's visual theme or colors.
- Introducing new backend data models or state management libraries.
- Changing the core logic of movie matching or filtering.