# Implementation Plan: Config Menu Redesign & Dashboard Button Relocation

## Phase 1: SearchBar Cleanup & ConfigMenu Tab Layout [checkpoint: 7ee5af1]
- [x] Task: Write Tests for Tabbed ConfigMenu (7b07925)
    - [x] Create tests in `frontend/tests/` to verify `ConfigMenu` renders the four category tab buttons (Upload, Cinemas, Excluded Movies, Other).
    - [x] Write test verifying that clicking a tab switches the active panel content.
- [x] Task: Implement ConfigMenu Tabbed Structure (7ee5af1)
    - [x] Add state for `activeTab` inside `ConfigMenu.tsx` (defaulting to "Upload").
    - [x] Refactor the component JSX to partition content into four distinct tab layouts based on the specification.
- [x] Task: Clean up SearchBar Toolbar (115b638)
    - [x] Remove the Scrape Dashboard (📊) button from `SearchBar.tsx`.
    - [x] Adjust `SearchBar` layout and spacing (and update corresponding test cases in `search_bar.test.tsx` if they assert on the dashboard button).
- [x] Task: Conductor - User Manual Verification 'Phase 1: SearchBar Cleanup & ConfigMenu Tab Layout' (Protocol in workflow.md)

## Phase 2: Left Side Sliding Drawer UX & Animations [checkpoint: 782ac55]
- [x] Task: Write Tests for Left Drawer Styling and Transitions (6686306)
    - [x] Write test to assert on left-side drawer CSS classes or transition style states being rendered in `ConfigMenu`.
- [x] Task: Implement Left-Side Sliding Drawer (782ac55)
    - [x] Create `.config-menu-drawer` CSS in `globals.css` with a sleek width (~390px), `position: fixed`, `left: 0`, and `height: 100%`.
    - [x] Implement transition transitions (`transform 0.3s ease-in-out` with `translateX(-100%)` for hidden state and `translateX(0)` for active state).
    - [x] Refactor `ConfigMenu.tsx` root container to utilize this new sliding drawer style.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Left Side Sliding Drawer UX & Animations' (Protocol in workflow.md)

## Phase 3: Scrape Dashboard Relocation & Refactoring [checkpoint: 115b638]
- [x] Task: Write Tests for Relocated Dashboard Trigger (89658)
    - [x] Assert that the Scrape Dashboard full-width button is present in the "Other" tab panel of `ConfigMenu`.
    - [x] Verify that clicking it triggers the `onDashboardToggle` callback.
- [x] Task: Implement Dashboard Button in ConfigMenu (115b638)
    - [x] Pass `onDashboardToggle` to `ConfigMenu` props inside `page.tsx`.
    - [x] Add the prominent full-width button to the bottom of the "Other" tab inside `ConfigMenu.tsx` and wire up the click event.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Scrape Dashboard Relocation & Refactoring' (Protocol in workflow.md)