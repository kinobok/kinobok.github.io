# Implementation Plan: UX Revamp for Sidepanel (Match Sidebar)

## Phase 1: Component Integration and Relocation [checkpoint: 6cf7802]
- [x] Task: Write Tests for Relocated Components and Search Focus (6cf7802)
    - [x] Create/update `MatchSidebar` tests to verify `DateSelector` is rendered within it.
    - [x] Write test for the new "Search" button clicking behavior (focusing the search input).
- [x] Task: Relocate and Style DateSelector (6cf7802)
    - [x] Move `DateSelector` component from `CinemaMap` (or `page.tsx`) to `MatchSidebar`.
    - [x] Update `DateSelector` CSS to scale down and fit within the sidepanel layout.
- [x] Task: Implement Search Button and Focus Logic (6cf7802)
    - [x] Add the "Search" button (magnifying glass) into the sidepanel header structure.
    - [x] Implement ref-based or event-based focus management to trigger focus on the `SearchBar` when the button is clicked.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Component Integration and Relocation' (Protocol in workflow.md)

## Phase 2: Mobile Sliding Panel UX [checkpoint: 3a6ac0b]
- [x] Task: Write Tests for Mobile Sliding Panel (3a6ac0b)
    - [x] Add tests simulating mobile viewport sizes and verifying the presence of CSS classes/states controlling the sliding state.
    - [x] Verify the conditional rendering/placement of the "Hide" and "Search" buttons in the expanded state.
- [x] Task: Implement Mobile Sliding Panel (3a6ac0b)
    - [x] Add CSS transitions and state logic to `MatchSidebar` to support a Google Maps-style sliding bottom sheet on mobile screens.
    - [x] Implement toggle states to handle the expand/collapse actions smoothly.
- [x] Task: Implement Expanded State Header Layout (3a6ac0b)
    - [x] Create a dedicated header `div` for the expanded state on mobile.
    - [x] Relocate the "Hide" button and the "Search" button into this header container, positioning the Search button on the right.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Mobile Sliding Panel UX' (Protocol in workflow.md)