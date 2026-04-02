# Design Spec: Frontend UX Redefined

**Date:** 2026-04-02
**Status:** Approved
**Topic:** Guiding users to Letterboxd exports and supporting ZIP uploads.

## 1. Overview
This specification focuses on improving the onboarding experience for kinꚘbok. It introduces a guidance modal to help users find their Letterboxd data and adds support for uploading the full Letterboxd export ZIP file, from which the `watchlist.csv` will be automatically extracted.

## 2. Goals
*   **User Guidance:** Provide a clear path for users to obtain their Letterboxd data.
*   **Ease of Use:** Eliminate the need for users to manually extract `watchlist.csv` from their export ZIP.
*   **Persistence:** Remember the user's uploaded watchlist across sessions using `localStorage`.

## 3. User Experience (UX)

### 3.1 Guidance Modal (`GuidanceModal.tsx`)
*   **Trigger:** Appears on first visit if no watchlist is found in `localStorage` and `hasSeenGuidance` is false.
*   **Content:**
    *   **Header:** "Find your Letterboxd watchlist in Warsaw."
    *   **Instruction:** "To see which movies from your watchlist are playing in Warsaw, you need your Letterboxd data."
    *   **Action Link:** A prominent button/link: [Export your data from Letterboxd](https://letterboxd.com/data/export/).
    *   **Note:** "Once you have the ZIP file, just upload it here. We'll find your `watchlist.csv` automatically."
    *   **Dismiss:** A "Got it" button that sets `hasSeenGuidance: true` in `localStorage`.
*   **Aesthetics:** Follows the "Dark Room" theme (#14181c background, #9ab text, #40bcf4 for links).

### 3.2 Enhanced Upload Flow (`MatchSidebar.tsx`)
*   **Input Support:** Accept both `.csv` and `.zip` files.
*   **ZIP Processing Logic:**
    1.  User selects a `.zip` file.
    2.  Browser-side extraction using `jszip`.
    3.  Search for `watchlist.csv` within the ZIP root or subdirectories.
    4.  If found: Parse the CSV and update the application state.
    5.  If NOT found: Show an alert: 
        > "Error: 'watchlist.csv' not found in the uploaded ZIP. Please ensure you are uploading the full Letterboxd export. If you believe this is a bug, please raise an issue at: https://github.com/kinobok/kinobok.github.io/issues/"
*   **Labeling:** Update the sidebar text to: "Upload your Letterboxd export ZIP (containing `watchlist.csv`) or the CSV itself."

### 3.3 Persistence (`page.tsx`)
*   **Initial Load:** Check `localStorage` for `kinobok_watchlist_uris`. If present, hydrate the application state immediately.
*   **Updates:** Every successful upload (ZIP or CSV) must update `localStorage`.

## 4. Technical Implementation
*   **Dependencies:** Add `jszip` and `@types/jszip`.
*   **Storage Key:** `kinobok_watchlist_uris` (JSON stringified array of Letterboxd URIs).
*   **Modal State Key:** `kinobok_guidance_seen` (boolean).

## 5. Testing Strategy
*   **ZIP Extraction:** Verify that various Letterboxd export ZIP structures (different versions/folders) are handled correctly.
*   **Error Handling:** Trigger the "missing file" alert with a dummy ZIP.
*   **Persistence:** Upload a watchlist, refresh the page, and ensure matches remain visible.
*   **Modal Logic:** Clear `localStorage` and verify the modal reappears.
