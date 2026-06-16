# Specification: User Guide Modal & Empty State Handling

## 1. Overview
The goal of this track is to improve the onboarding experience for new users of kinꚘbok. We will introduce a "Let's get started" user guide modal that explains how to export and upload a Letterboxd watchlist. Additionally, we will handle edge cases where a user fails to upload the watchlist correctly or does not have one (e.g., they are not a Letterboxd user).

## 2. Requirements

### 2.1 "Let's Get Started" User Guide Modal
- **Trigger:** Display automatically when a user visits the site without a locally stored watchlist, or via a "Help / Guide" button in the UI.
- **Content:**
  - Clear, step-by-step instructions on how to export a watchlist from Letterboxd.
  - A visual cue or button to trigger the CSV upload directly from the modal.
- **Action:**
  - A dismiss/close button for users who already know what to do.

### 2.2 Error Handling / Fallback State
- **Invalid Upload:** If the user uploads a malformed CSV or a file that is not a Letterboxd export, display a clear error message and prompt them to try again.
- **No Watchlist (Non-Letterboxd User):**
  - Provide an alternative path. Since the app relies on the watchlist for matching, we should offer a way to browse all Warsaw cinemas or view popular/rare screenings without a watchlist.
  - Add a "Browse without watchlist" option that bypasses the upload requirement and shows all available data.

## 3. Technical Approach
- **UI Components:** Create a new `GuidanceModal.tsx` component.
- **State Management:** Update `page.tsx` to handle the modal visibility state and the "browse all" state.
- **CSV Parsing:** Enhance the error handling in `utils/csv_parser.ts` to return specific error types (e.g., missing columns) so the UI can react appropriately.

## 4. Acceptance Criteria
- [ ] A new user sees the guide modal upon their first visit.
- [ ] The modal contains clear instructions and an upload action.
- [ ] Uploading an invalid file shows an error message.
- [ ] Users can choose to "Browse without watchlist", which shows all cinema data without filtering by watchlist.