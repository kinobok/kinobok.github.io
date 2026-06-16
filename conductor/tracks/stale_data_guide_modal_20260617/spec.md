# Specification: User Guide Modal for Stale Data Reminder

## 1. Overview
This track introduces a new "User Guide / Reminder" modal to the frontend. Its purpose is to detect when the user's locally stored Letterboxd watchlist is older than 7 days and gently prompt them to update it. This ensures users are matching against current cinema showtimes with up-to-date watchlist data.

## 2. Functional Requirements
- **Age Detection:** On application load, check the timestamp of the locally stored watchlist.
- **Trigger Condition:** If the watchlist data is older than 7 days (168 hours), display the reminder modal.
- **Modal Behavior (Non-blocking):** The modal should overlay the UI but be easily dismissible (e.g., clicking outside the modal or using a close button) without forcing an immediate update.
- **Snooze Functionality:** If the user dismisses the modal without updating their data, the modal should not appear again for at least 24 hours.
- **Modal Content:**
  - Display the exact date the user last uploaded their watchlist.
  - Provide brief instructions on how to export a fresh watchlist from Letterboxd.
- **Modal Actions:**
  - **Upload New Data:** A button that directly opens the file picker to upload a new CSV.
  - **Letterboxd Link:** A direct link to the Letterboxd settings/data export page.
  - **Dismiss / Close:** A clear action to close the modal.

## 3. Non-Functional Requirements
- **Privacy:** All checks for data age and snooze states must be handled entirely client-side (using `localStorage` or `IndexedDB`).
- **UI/UX Consistency:** The modal should match the application's overall styling and use existing components where possible.

## 4. Acceptance Criteria
- [ ] A user with a watchlist older than 7 days sees the reminder modal upon visiting the app.
- [ ] The modal displays the last upload date and export instructions.
- [ ] The modal contains "Upload", "Letterboxd", and "Close" actions.
- [ ] Clicking "Upload" successfully opens the file picker.
- [ ] Dismissing the modal sets a snooze state for 24 hours, preventing the modal from reappearing on subsequent visits within that timeframe.
- [ ] A user with a watchlist newer than 7 days does not see the modal.

## 5. Out of Scope
- Automatic background fetching of Letterboxd data (requires API access).
- Changes to how the CSV data is parsed or matched.
