# Implementation Plan: User Guide Modal for Stale Data Reminder

## Phase 1: State Management & Logic [checkpoint: 23c7c7e]
- [x] Task: Implement Watchlist Age and Snooze Logic [bbae188]
    - [x] Write failing unit tests for checking data age (> 7 days) and snooze state (24 hours).
    - [x] Implement storage logic to record watchlist upload timestamp and snooze timestamp in `localStorage`.
    - [x] Run tests and verify >80% coverage.
- [x] Task: Conductor - User Manual Verification 'Phase 1: State Management & Logic' (Protocol in workflow.md) [23c7c7e]

## Phase 2: UI Component Implementation [checkpoint: 4ec4153]
- [x] Task: Create Reminder Modal Component [49c55d7]
    - [x] Write failing component tests for `UpdateReminderModal` (testing render of text, props, and button interactions).
    - [x] Implement the `UpdateReminderModal` component UI, ensuring non-blocking behavior.
    - [x] Run tests and verify coverage.
- [x] Task: Conductor - User Manual Verification 'Phase 2: UI Component Implementation' (Protocol in workflow.md) [4ec4153]

## Phase 3: Main App Integration [checkpoint: 5a138b7]
- [x] Task: Integrate Modal into Application [a5141bc]
    - [x] Write tests ensuring the main app evaluates the age/snooze state and conditionally renders the modal.
    - [x] Implement the state evaluation hook/logic in the main container.
    - [x] Connect the "Upload" button to the existing file picker logic and the "Close" button to the snooze logic.
    - [x] Run tests to ensure complete functionality.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Main App Integration' (Protocol in workflow.md) [5a138b7]

## Phase: Review Fixes
- [x] Task: Apply review suggestions [86b414e]
