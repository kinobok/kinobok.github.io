# Implementation Plan: UX Revamp for Sidepanel (Match Sidebar)

## Phase 1: Component Integration and Relocation
- [ ] Task: Write Tests for Relocated Components and Search Focus
    - [ ] Create/update `MatchSidebar` tests to verify `DateSelector` is rendered within it.
    - [ ] Write test for the new "Search" button clicking behavior (focusing the search input).
- [ ] Task: Relocate and Style DateSelector
    - [ ] Move `DateSelector` component from `CinemaMap` (or `page.tsx`) to `MatchSidebar`.
    - [ ] Update `DateSelector` CSS to scale down and fit within the sidepanel layout.
- [ ] Task: Implement Search Button and Focus Logic
    - [ ] Add the "Search" button (magnifying glass) into the sidepanel header structure.
    - [ ] Implement ref-based or event-based focus management to trigger focus on the `SearchBar` when the button is clicked.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Component Integration and Relocation' (Protocol in workflow.md)

## Phase 2: Mobile Sliding Panel UX
- [ ] Task: Write Tests for Mobile Sliding Panel
    - [ ] Add tests simulating mobile viewport sizes and verifying the presence of CSS classes/states controlling the sliding state.
    - [ ] Verify the conditional rendering/placement of the "Hide" and "Search" buttons in the expanded state.
- [ ] Task: Implement Mobile Sliding Panel
    - [ ] Add CSS transitions and state logic to `MatchSidebar` to support a Google Maps-style sliding bottom sheet on mobile screens.
    - [ ] Implement toggle states to handle the expand/collapse actions smoothly.
- [ ] Task: Implement Expanded State Header Layout
    - [ ] Create a dedicated header `div` for the expanded state on mobile.
    - [ ] Relocate the "Hide" button and the "Search" button into this header container, positioning the Search button on the right.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Mobile Sliding Panel UX' (Protocol in workflow.md)